/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default;

const config = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  allowedDevOrigins: ["9a5bfd6b-cdf0-4a02-b3f1-8c1732d06db4-00-35vewrmn53e0l.spock.replit.dev"],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self'",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Commented out to allow app to run in Replit's iframe environment
          // {
          //   key: 'X-Frame-Options',
          //   value: 'DENY',
          // },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

const nextConfig = withPWA({
  dest: 'public',
  disable: false, // Enable in development and production
  cacheOnFrontendNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  workboxOptions: {
    disableDevLogs: true,
  }
})(config);

module.exports = nextConfig;
