// Use .mjs extension for ESM
import withSerwistInit from '@serwist/next';

// Initialize Serwist with the correct configuration from official docs
const withSerwist = withSerwistInit({
  // Where the service worker file will be
  swSrc: 'app/serwist-sw.js',
  // Where the service worker file will be output
  swDest: 'public/sw.js',
  // Enable service worker in all environments for testing
  disable: false,
});

export default withSerwist({
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'",
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
  }
});