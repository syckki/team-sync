// Import original GenerateSW from workbox-webpack-plugin
const { GenerateSW } = require('workbox-webpack-plugin');

// Create a patched version that doesn't throw the warning
class PatchedGenerateSW extends GenerateSW {
  constructor(config) {
    super(config);
    // Override the alreadyCalled property
    Object.defineProperty(this, 'alreadyCalled', {
      get() {
        return false;
      },
      set() {}
    });
  }
}

// Configure Next PWA with our custom workbox plugin
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'production' ? false : true, // Enable only in production
  fallbacks: {
    image: '/icons/offline-image.svg' // Fallback for images
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
});
