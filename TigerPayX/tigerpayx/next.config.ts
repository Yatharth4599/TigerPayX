import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone output for Vercel (it's for Docker)
  // Vercel handles this automatically
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
  // Ensure CSS is properly processed
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  // Turbopack configuration (Next.js 16 uses Turbopack by default)
  // Empty config to silence the warning about webpack config
  turbopack: {},
  // Completely remove experimental section to prevent optimizeCss
  // Next.js 16.0.3 enables optimizeCss by default, but it requires critters
  // We'll handle CSS optimization through Vercel's built-in optimization
};

export default nextConfig;
