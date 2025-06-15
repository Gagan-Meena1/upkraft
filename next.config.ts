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
      sizeLimit: '500mb',
    },
    responseLimit: false,
  },
  
  // Experimental features
  experimental: {
    serverTimeout: 600000, // 10 minutes for large uploads
    serverActions: {
      bodySizeLimit: '1000mb'
    },
    missingSuspenseWithCSRBailout: false
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
};

export default nextConfig;