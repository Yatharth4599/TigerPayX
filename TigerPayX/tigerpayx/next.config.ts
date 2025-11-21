import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone output for Vercel (it's for Docker)
  // Vercel handles this automatically
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
  // Explicitly disable optimizeCss to prevent critters dependency
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;
