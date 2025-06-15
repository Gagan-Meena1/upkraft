import type { NextConfig } from "next";
// Extend the experimental config type
interface CustomExperimentalConfig {
  serverActions: {
    bodySizeLimit: string
  };
  missingSuspenseWithCSRBailout: boolean;
}

module.exports = {
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
    responseLimit: false,
  },
  experimental: {
    serverTimeout: 600000, // 10 minutes for large uploads
  }
}

interface CustomNextConfig extends Omit<NextConfig, 'experimental'> {
  experimental: CustomExperimentalConfig;
}

const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '1000mb'
    },
    missingSuspenseWithCSRBailout: false
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  onError: (error) => {
    console.error('Next.js build error:', error);
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
} as CustomNextConfig;

export default nextConfig;