const withPWA = require('next-pwa')({
  dest: 'public',
  disable: false, // Enable in development and production
  register: true,
  skipWaiting: true,
  fallbacks: {
    // Fallback pages when offline
    document: '/_offline', // This is the main page fallback
    image: '/fallback-image.svg',
  },
  runtimeCaching: [
    // Cache the home page for offline access
    {
      urlPattern: /^\/$|^\/index$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'homepage-cache',
        expiration: {
          maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
        },
      },
    },
    // Cache CSS, JS, and other static assets
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    // Cache images
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    // Cache fonts
    {
      urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 180, // 180 days
        },
      },
    },
    // Cache API responses for encrypted threads
    {
      urlPattern: /\/api\/download/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-responses',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
        },
        networkTimeoutSeconds: 10,
      },
    },
    // Cache thread view pages
    {
      urlPattern: /\/view\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'thread-pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
        },
        networkTimeoutSeconds: 10,
      },
    },
    // Default network-first strategy for everything else
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'general-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
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
