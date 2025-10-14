import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use static export so `next build` produces files in `out/` for GitHub Pages
  output: 'export',
};

export default nextConfig;
