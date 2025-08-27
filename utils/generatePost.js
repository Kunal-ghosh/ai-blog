
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

    try {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey)
            throw new Error("Missing OPENROUTER_API_KEY in environment variables.");

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "deepseek/deepseek-r1:free",
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
            }
        );
        // console.log("response", response.data);
        let content =
            response.data?.choices?.[0]?.message?.content?.trim() ||
            "No content generated.";

        const start = content.indexOf("/s") + 2;
        const end = content.indexOf("/s", start);
        const filename1 = start > 1 && end > start ? content.substring(start, end).trim() : "untitled";

        let title = filename1;
        const slug = slugify(title, { lower: true, strict: true });
        const filename = path.join(postsDir, `${slug}.js`);

        const startcontent = content.indexOf("/p") + 2;
        const endcontent = content.indexOf("/p", startcontent);
        let content1 = startcontent > 1 && endcontent > startcontent ? content.substring(startcontent, endcontent).trim() : "untitled";
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

        // const filename1 = subject.replace(/\s+/g, "-");

        const filename2 = path.join(postsDir, `${filename1}.js`);
        fs.writeFileSync(filename2, postContent);
        console.log("filename1", filename1);
        console.log(`✅ Post generated: ${filename2}`);
    } catch (err) {
        console.error("❌ Error generating post:", err.message);
    }
}

generatePost();
