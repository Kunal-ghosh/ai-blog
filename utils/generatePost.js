
// import 'dotenv/config';
import fs from "fs";
import path from "path";
import axios from "axios";
import slugify from "slugify";
import dotenv from "dotenv";

dotenv.config();

// Folder for blog posts
const postsDir = path.join(process.cwd(), "pages/posts");
if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_GEMINI_MODELS = [
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractBetweenTags(content, tagName) {
  const pattern = new RegExp(`/${tagName}([\\s\\S]*?)/${tagName}`, "i");
  const match = content.match(pattern);
  return match ? match[1].trim() : "";
}

function buildUniqueSlug(baseTitle) {
  const fallbackTitle = baseTitle || `ai-post-${Date.now()}`;
  const slugBase =
    slugify(fallbackTitle, { lower: true, strict: true }) ||
    `ai-post-${Date.now()}`;
  let slug = slugBase;
  let counter = 1;

  while (fs.existsSync(path.join(postsDir, `${slug}.js`))) {
    slug = `${slugBase}-${counter}`;
    counter += 1;
  }

  return slug;
}

async function requestOpenRouterContent(apiKey, prompt, model) {
  const response = await axios.post(
    OPENROUTER_URL,
    {
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data?.choices?.[0]?.message?.content?.trim() || "";
}

async function requestGeminiContent(apiKey, prompt, preferredModel) {
  const candidateModels = preferredModel
    ? [
        preferredModel,
        ...DEFAULT_GEMINI_MODELS.filter((model) => model !== preferredModel),
      ]
    : DEFAULT_GEMINI_MODELS;

  let lastError = null;

  for (const model of candidateModels) {
    try {
      const response = await axios.post(
        `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const text =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      if (!text) {
        throw new Error(`Gemini model ${model} returned empty content.`);
      }

      console.log(`Using Gemini model: ${model}`);
      return text;
    } catch (err) {
      lastError = err;
      const status = err.response?.status;

      if (status === 404) {
        console.warn(`Gemini model not found: ${model}. Trying next fallback.`);
        continue;
      }

      throw err;
    }
  }

  throw new Error(
    `Gemini fallback failed for all models. Last error: ${lastError?.message || "Unknown error"}`,
  );
}

async function generatePost() {
  const prompt = `Give the response in exactly this format. Keep the subject in /s tags and the post in /p tags. The subject should be between 2 and 5 words.
subject : /s topic of the post/s
post : /p text /p

Write 2 concise lines on a recent real world event and give a topic name for the post. Do not include markdown, explanations, or any extra text outside the required tags.
`;

  const openRouterApiKey =
    process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL;
  const openRouterModel = process.env.OPENROUTER_MODEL || "qwen/qwen3-4b:free";

  if (!openRouterApiKey && !geminiApiKey) {
    throw new Error(
      "Missing API key. Set DEEPSEEK_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY.",
    );
  }

  let generatedContent = "";
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (openRouterApiKey) {
        generatedContent = await requestOpenRouterContent(
          openRouterApiKey,
          prompt,
          openRouterModel,
        );
        console.log(`Using OpenRouter model: ${openRouterModel}`);
      } else {
        generatedContent = await requestGeminiContent(
          geminiApiKey,
          prompt,
          geminiModel,
        );
        console.log("Using Gemini fallback provider.");
      }

      if (!generatedContent) {
        throw new Error("Model returned empty content.");
      }

      break;
    } catch (err) {
      lastError = err;
      const status = err.response?.status;

      if (status === 429 && geminiApiKey) {
        console.warn(
          `OpenRouter attempt ${attempt} was rate-limited. Falling back to Gemini.`,
        );
        generatedContent = await requestGeminiContent(
          geminiApiKey,
          prompt,
          geminiModel,
        );
        break;
      }

      console.error(`❌ Attempt ${attempt} failed:`, err.message);
      if (attempt < 3) {
        await sleep(attempt * 5000);
      }
    }
  }

  if (!generatedContent) {
    throw new Error(
      `Error generating post after 3 attempts: ${lastError?.message || "Unknown error"}`,
    );
  }

  const title = extractBetweenTags(generatedContent, "s") || "Untitled";
  const content = extractBetweenTags(generatedContent, "p") || generatedContent;
  const slug = buildUniqueSlug(title);
  const outputPath = path.join(postsDir, `${slug}.js`);

  const postContent = `import React from "react";

const Post = () => (
  <article style={{ padding: "2rem" }}>
    <h1>{${JSON.stringify(title)}}</h1>
    <p>{${JSON.stringify(content)}}</p>
  </article>
);

export default Post;
`;

  fs.writeFileSync(outputPath, postContent);
  console.log(`✅ Post generated: ${outputPath}`);
}

generatePost().catch((err) => {
  console.error("❌ Error generating post:", err.message);
  process.exitCode = 1;
});
