/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // required for static export
  images: {
    unoptimized: true,
  },
  basePath: "/ai-blog", // 👈 your repo name here
  assetPrefix: "/ai-blog/",
  trailingSlash: true,


};

export default nextConfig;
