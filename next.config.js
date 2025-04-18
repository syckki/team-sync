const withPWA = require('next-pwa')({
  dest: 'public',
  disable: false, // Enable in development and production
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: '/_offline', // Fallback to offline page when network is unavailable
    image: '/images/fallback-image.png',
    font: '/fonts/fallback-font.woff2'
  },
  runtimeCaching: [
    // HTML pages - network first with fallback to cache
    {
      urlPattern: /^https?.*\/(?:view|thread)\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'page-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
        }
      }
    },
    // API responses - stale while revalidate for good performance
    {
      urlPattern: /^https?.*\/api\/(?:download|upload).*$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 // 1 day
        }
      }
    },
    // Static assets - cache first for the best performance
    {
      urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|gif|woff2)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    // Default - everything else uses network first with caching
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'fallback-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
        },
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
