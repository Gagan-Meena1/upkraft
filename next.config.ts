import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // This allows production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '1000mb'  // Increase to a suitable limit (e.g., 10MB)
    },
  },
  eslint: {
    // This allows production builds to succeed even with ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;