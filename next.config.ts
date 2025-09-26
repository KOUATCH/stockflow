import { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig:NextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  serverExternalPackages: [], // Keep empty to allow bundling
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle prettier version conflicts
      config.externals = config.externals.filter(
        (external: any) => {
          if (typeof external === 'string') {
            return !external.includes('prettier');
          }
          return true;
        }
      );
    }
    return config;
  },
};

export default nextConfig;