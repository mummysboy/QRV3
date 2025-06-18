import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {}, // ✅ correct shape is now an object (empty or with options)
  },
  webpack: (config: WebpackConfig) => {
    config.module!.exprContextCritical = false;
    return config;
  },
};


export default nextConfig;
