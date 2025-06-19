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
  
  // API configuration
  api: {
    bodyParser: {
      sizeLimit: '1000mb',
    },
    responseLimit: '1000mb',
  },
  
  // Experimental features
  experimental: {
    serverTimeout: 600000, // 10 minutes for large uploads
    serverActions: {
      bodySizeLimit: '1000mb'
    },
    missingSuspenseWithCSRBailout: false,
    largePageDataBytes: 512 * 1000000, // Increase page data limit
  },
  
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // Error handling
  onError: (error) => {
    console.error('Next.js build error:', error);
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