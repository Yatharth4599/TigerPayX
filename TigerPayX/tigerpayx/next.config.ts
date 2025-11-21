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
  // Ensure CSS is included in the build
  webpack: (config, { isServer }) => {
    // Ensure CSS is processed correctly
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }
    return config;
  },
  // Completely remove experimental section to prevent optimizeCss
  // Next.js 16.0.3 enables optimizeCss by default, but it requires critters
  // We'll handle CSS optimization through Vercel's built-in optimization
};

export default nextConfig;
