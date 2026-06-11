import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  basePath: '/contributions',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      }
    ],
    unoptimized: true,
  },
};

export default nextConfig;
