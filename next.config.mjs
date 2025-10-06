/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['bcrypt'],
  experimental: {
    // Reduce memory usage and improve caching
    optimizePackageImports: ['@/components', '@/lib'],
  },
  webpack: (config, { isServer, dev }) => {
    // Completely exclude bcrypt from client-side bundling
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'bcrypt': false,
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
      config.externals.push('bcrypt');
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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    const headers = [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ]
      }
    ];

    // Add HSTS header only in production
    if (process.env.NODE_ENV === 'production') {
      headers.push({
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      });
    }

    return headers;
  },
  async rewrites() {
    return [
      {
        source: '/security.txt',
        destination: '/api/security-txt'
      },
      {
        source: '/.well-known/security.txt',
        destination: '/api/security-txt'
      }
    ];
  }
};

export default nextConfig;