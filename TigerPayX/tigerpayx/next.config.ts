import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone output for Vercel (it's for Docker)
  // Vercel handles this automatically
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
  // Removed optimizeCss experimental feature - it requires 'critters' package
  // Vercel handles CSS optimization automatically
};

export default nextConfig;
