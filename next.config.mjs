// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// };

// export default nextConfig;









// next.config.mjs

// const isProd = process.env.NODE_ENV === 'production'
// const repoName = 'ai-blog' // DO NOT change (must match your GitHub repo name)

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // Export static HTML for GitHub Pages
//   output: 'export',

//   // Required when hosting under https://USERNAME.github.io/ai-blog
//   basePath: isProd ? `/${repoName}` : '',
//   assetPrefix: isProd ? `/${repoName}/` : '',

//   // Make <Image> work with static export (or just use <img>)
//   images: { unoptimized: true },

//   // Safer URLs on GitHub Pages (/path/ -> /path/index.html)
//   trailingSlash: true,
// }

// export default nextConfig







/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // required for static export
  images: {
    unoptimized: true,
  },
  basePath: "/ai-blog", // 👈 your repo name here
  assetPrefix: "/ai-blog/",
  trailingSlash: true, // Add this for better GitHub Pages compatibility
};

export default nextConfig;
