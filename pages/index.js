import fs from "fs";
import path from "path";
import Link from "next/link";
import styles from "../styles/Home.module.css"; // 👈 import css module

export default function Home({ posts }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB").replace(/\//g, "-");
  const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-");
  const date = `${dateStr} ${timeStr}`;
  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <h2>Topics</h2>
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      </aside>

      <main className={styles.content}>
        <div className={styles.grid}>
          {posts.map((post) => (
            <div key={post.slug} className={styles.card}>
              <h2>{post.title}</h2>
              <p>{post.content}</p>
              <h1>this is test</h1>
              <p className={styles.date}>{date}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// Static generation: read files from /posts
export async function getStaticProps() {
  const postsDir = path.join(process.cwd(), "pages/posts");
  const filenames = fs.readdirSync(postsDir);

  const posts = filenames
    .filter((filename) => filename.endsWith(".js")) // ✅ Only include .js files
    .map((filename) => {
      const slug = filename.replace(".js", "");
      const title = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      // Read the file content
      const filePath = path.join(postsDir, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");

      // Extract text inside <p>...</p>
      const match = fileContent.match(/<p>(.*?)<\/p>/s);
      const content = match ? match[1] : "";

      return {
        slug,
        title,
        content,
      };
    });

  return {
    props: {
      posts,
    },
  };
}





// import fs from "fs";
// import path from "path";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import styles from "../styles/Home.module.css"; // 👈 import css module

// export default function Home({ posts }) {
//   const [images, setImages] = useState({});

//   const now = new Date();
//   const dateStr = now.toLocaleDateString("en-GB").replace(/\//g, "-");
//   const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-");
//   const date = `${dateStr} ${timeStr}`;

//   useEffect(() => {
//     async function fetchImages() {
//       const results = {};
//       for (const post of posts) {
//         try {
//           const res = await fetch(`/api/wikiImage?query=${encodeURIComponent(post.title)}`, {
//             headers: { Accept: "application/json" },
//           });


//           const data = await res.json();
//           if (data.image) {
//             results[post.slug] = data.image;
//           }
//         } catch (err) {
//           console.error("Error fetching image:", err);
//         }
//       }
      
//       setImages(results);
//     }

//     fetchImages();
//   }, [posts]);

//   return (
//     <div className={styles.container}>
//       {/* Sidebar */}
//       <aside className={styles.sidebar}>
//         <h2>Topics</h2>
//         <ul>
//           {posts.map((post) => (
//             <li key={post.slug}>
//               <Link href={`/posts/${post.slug}`}>{post.title}</Link>
//             </li>
//           ))}
//         </ul>
//       </aside>

//       <main className={styles.content}>
//         <div className={styles.grid}>
//           {posts.map((post) => (
//             <div key={post.slug} className={styles.card}>
//               {images[post.slug] && (
//                 <img
//                   src={images[post.slug]}
//                   alt={post.title}
//                   className={styles.cardImage}
//                 />
//               )}
//               <h2>{post.title}</h2>
//               <p>{post.content}</p>
//               <p className={styles.date}>{date}</p>
//             </div>
//           ))}
//         </div>
//       </main>
//     </div>
//   );
// }

// // Static generation: read files from /posts
// export async function getStaticProps() {
//   const postsDir = path.join(process.cwd(), "pages/posts");
//   const filenames = fs.readdirSync(postsDir);

//   const posts = filenames
//     .filter((filename) => filename.endsWith(".js")) // ✅ Only include .js files
//     .map((filename) => {
//       const slug = filename.replace(".js", "");
//       const title = slug
//         .replace(/-/g, " ")
//         .replace(/\b\w/g, (c) => c.toUpperCase());

//       // Read the file content
//       const filePath = path.join(postsDir, filename);
//       const fileContent = fs.readFileSync(filePath, "utf-8");

//       // Extract text inside <p>...</p>
//       const match = fileContent.match(/<p>(.*?)<\/p>/s);
//       const content = match ? match[1] : "";

//       return {
//         slug,
//         title,
//         content,
//       };
//     });

//   return {
//     props: {
//       posts,
//     },
//   };
// }
