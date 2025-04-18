const withPWA = require('next-pwa')({
  dest: 'public',
  disable: false, // Enable in development and production
  register: true,
  skipWaiting: true,
  fallbacks: {
    // Add offline fallback pages
    document: '/_offline', // Use _offline.js as fallback when document not cached
    image: '/icons/offline-image.svg' // Fallback for images
  }
  // Using default runtimeCaching configuration
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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'",
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
