const withPWA = require('next-pwa')({
  dest: 'public',
  disable: false, // Enable in development and production
  fallbacks: {
    image: '/icons/offline-image.svg', // Fallback for images
    document: '/_offline', // Fallback for documents
    'font': false,
    'manifest': '/offline-manifest.json'
  },
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200
        }
      }
    },
    {
      urlPattern: /\.(js|css|woff2|woff|ttf|otf|eot|svg|png|jpg|jpeg|gif|ico)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'staticAssets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 * 30 // 30 days
        }
      }
    },
    {
      urlPattern: /manifest\.json$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'manifest',
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 24 * 60 * 60 * 30 // 30 days
        }
      }
    }
  ]
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
  },
});
