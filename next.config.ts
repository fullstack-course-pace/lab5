/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",          // produce static files
  images: { unoptimized: true },
  basePath: "/lab5",         // repo name (so assets load under /lab5)
  assetPrefix: "/lab5/",
  trailingSlash: true,       // avoids some index.html path issues on Pages
};

export default nextConfig;
