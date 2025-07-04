/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // React strict mode
  reactStrictMode: true,
  
  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '1000mb'
    },
    largePageDataBytes: 512 * 1000000, // Increase page data limit
  },
  
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Additional configuration for large files
  webpack: (config) => {
    config.performance = {
      ...config.performance,
      maxAssetSize: 512 * 1000000,
      maxEntrypointSize: 512 * 1000000,
    };
    return config;
  },
};

export default nextConfig;