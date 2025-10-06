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
  serverExternalPackages: ['argon2'], // Externalize argon2 for server
  webpack: (config, { isServer, dev }) => {
    // Completely exclude argon2 and Node.js modules from client-side bundling
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'argon2': false,
        'node:crypto': false,
        'node:util': false,
        'node:fs': false,
        'node:path': false,
        'crypto': false,
        'fs': false,
        'path': false,
        'util': false,
      };
    } else {
      // Server-side externals for native modules
      config.externals.push('argon2');

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

    // Reduce file watching overhead on Windows
    if (dev) {
      config.watchOptions = {
        ignored: [
          '**/node_modules',
          '**/.git',
          '**/.next',
          '**/DumpStack.log.tmp',
          '**/pagefile.sys',
        ],
        poll: 1000, // Use polling for Windows file system compatibility
        aggregateTimeout: 300,
      };
    }

    return config;
  },
};

export default nextConfig;