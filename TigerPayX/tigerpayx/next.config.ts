import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone output for Vercel (it's for Docker)
  // Vercel handles this automatically
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
  // Completely remove experimental section to prevent optimizeCss
  // Next.js 16.0.3 enables optimizeCss by default, but it requires critters
  // We'll handle CSS optimization through Vercel's built-in optimization
};

export default nextConfig;
