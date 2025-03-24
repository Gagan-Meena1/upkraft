import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '1000mb'  // Increase to a suitable limit (e.g., 10MB)
    },
  },
};

export default nextConfig;
