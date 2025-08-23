// utils/generatePost.js
import fs from "fs";
import path from "path";

// --- Config ---
const postsDir = path.join(process.cwd(), "pages/posts");

// --- Helper: create a filename from title ---
function slugify(title) {
  return title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

// --- Main function ---
async function main() {
  // Replace this with a call to a free AI API if you like
  const title = `AI Post ${new Date().toLocaleDateString()}`;
  const content = `This is an automatically generated AI blog post on ${new Date().toDateString()}. 🚀`;

  const slug = slugify(title);
  const filename = path.join(postsDir, `${slug}.js`);

  const fileData = `export default function ${slug.replace(/-/g, "_")}() {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>${title}</h1>
        <p>${content}</p>
      </div>
    );
  }`;

  fs.writeFileSync(filename, fileData, "utf8");
  console.log(`✅ Created new post: ${filename}`);
}

main();
