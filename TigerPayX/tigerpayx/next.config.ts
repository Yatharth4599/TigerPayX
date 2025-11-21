import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone output for Vercel (it's for Docker)
  // Vercel handles this automatically
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
  // Ensure CSS is properly handled
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
