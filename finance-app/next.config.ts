import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.susercontent.com', // Shopee
      },
      {
        protocol: 'https',
        hostname: '*.tokopedia.net', // Tokopedia
      },
      {
        protocol: 'https',
        hostname: '*.tiktokcdn.com', // TikTok
      },
      {
        protocol: 'https',
        hostname: '*.ibyteimg.com', // TikTok
      }
    ],
  },
};

export default nextConfig;
