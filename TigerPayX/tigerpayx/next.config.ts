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
  // Ensure CSS is included in the build
  experimental: {
    optimizeCss: false, // Disable CSS optimization to ensure all styles are included
  },
};

export default nextConfig;
