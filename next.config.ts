import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {},
  },
  webpack: (config: WebpackConfig) => {
    config.module!.exprContextCritical = false;
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add configuration for larger file uploads
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
  // Improve mobile compatibility
  headers: async () => {
    return [
      {
        source: '/api/business/upload-logo',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
