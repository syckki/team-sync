/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default;

// Basic configuration for Next.js
const config = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  // Specifically for Next.js 14+ to address the cross-origin warning
  // This is used when running in Replit's environment
  output: 'standalone',
  distDir: '.next',
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // More permissive CSP to allow cross-origin requests from Replit
          {
            key: 'Content-Security-Policy',
            value: "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

// PWA configuration
const nextConfig = withPWA({
  dest: 'public',
  disable: false, // Enable in development and production
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  swcMinify: true,
  workboxOptions: {
    disableDevLogs: true,
  },
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ]
})(config);

module.exports = nextConfig;
