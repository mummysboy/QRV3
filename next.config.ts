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
  async rewrites() {
    return [
      {
        source: "/reward/:path*",
        destination: "/", // this makes /reward/* render the homepage
      },
    ];
  },
};

export default nextConfig;
