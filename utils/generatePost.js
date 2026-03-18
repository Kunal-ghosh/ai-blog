
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

async function generatePost() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB").replace(/\//g, "-");
  const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-");

  //   let title = `AI Post ${dateStr} ${timeStr}`;
  //   const slug = slugify(title, { lower: true, strict: true });
  //   const filename = path.join(postsDir, `${slug}.js`);

  const prompt = `give the response in this format , keep the subject in /s and post in /p tags and the subject should be between 2 to 3 words
subject : /s topic of the post/s
post : /p text /p

                Write a 2 lines on a latest event in the world. and give a topic name for the post
`;

  // Support both DEEPSEEK_API_KEY and OPENROUTER_API_KEY for compatibility
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey)
    throw new Error(
      "Missing DEEPSEEK_API_KEY or OPENROUTER_API_KEY in environment variables.",
    );

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "qwen/qwen3-4b:free",
          // model: "openai/gpt-4o",
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
      let content =
        response.data?.choices?.[0]?.message?.content?.trim() ||
        "No content generated.";

      const start = content.indexOf("/s") + 2;
      const end = content.indexOf("/s", start);
      const filename1 =
        start > 1 && end > start
          ? content.substring(start, end).trim()
          : "untitled";

      let title = filename1;
      const slug = slugify(title, { lower: true, strict: true });
      const filename = path.join(postsDir, `${slug}.js`);

      const startcontent = content.indexOf("/p") + 2;
      const endcontent = content.indexOf("/p", startcontent);
      let content1 =
        startcontent > 1 && endcontent > startcontent
          ? content.substring(startcontent, endcontent).trim()
          : "untitled";
      content = content1;
      console.log("content1", content1);
      console.log("content", content);

      const postContent = `
            import React from 'react';

            const Post = () => (
              <article style={{ padding: '2rem' }}>
                <h1>${title}</h1>
                <p>${content}</p>
              </article>
            );

            export default Post;
            `;

      const filename2 = path.join(postsDir, `${filename1}.js`);
      fs.writeFileSync(filename2, postContent);
      console.log("filename1", filename1);
      console.log(`✅ Post generated: ${filename2}`);
      return;
    } catch (err) {
      lastError = err;
      console.error(`❌ Attempt ${attempt} failed:`, err.message);
      if (attempt < 3) {
        // Wait 2 seconds before retrying
        await new Promise((res) => setTimeout(res, 2000));
      }
    }
  }
  // If all attempts failed
  console.error(
    "❌ Error generating post after 3 attempts:",
    lastError?.message,
  );
}

generatePost();
