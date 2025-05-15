/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default;

const config = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;
              font-src 'self' https://fonts.gstatic.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data:;
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              frame-src https://stately.ai;
            `
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Commented out to allow app to run in Replit's iframe environment
          // {
          //   key: 'X-Frame-Options',
          //   value: 'DENY',
          // },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

const nextConfig = withPWA({
  dest: "public",
  disable: false, // Enable in development and production
  cacheOnFrontendNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  workboxOptions: {
    disableDevLogs: true,
    exclude: [/dynamic-css-manifest\.json$/],
  },
})(config);

module.exports = nextConfig;
