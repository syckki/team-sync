const withPWA = require('next-pwa')({
  dest: 'public',
  disable: false, // Enable in development to test PWA features
  register: true,
  skipWaiting: true,
  // Don't specify swSrc to let workbox handle the generation
  buildExcludes: [/middleware-manifest.json$/],
  fallbacks: {
    image: '/icons/offline-image.svg', // Fallback for images
    document: '/_offline' // Fallback for pages
  }
});

module.exports = withPWA({
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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self'; manifest-src 'self'; worker-src 'self' blob:",
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
});
