const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development' ? false : false, // Enable in both dev and prod
  register: true,
  skipWaiting: true,
  dynamicStartUrl: true, // Allow navigation to dynamic routes when offline
  buildExcludes: [/middleware-manifest\.json$/], // Exclude middleware manifest
  fallbacks: {
    // Fallback for different document types
    document: '/offline', // You'll need to create this page
    image: '/images/fallback.png', // Default image if network is offline
  },
  // Enhanced caching strategy
  runtimeCaching: [
    // Cache the API routes
    {
      urlPattern: /^https?:\/\/.*\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
        },
        networkTimeoutSeconds: 10, // Fallback to cache if network request takes more than 10 seconds
      },
    },
    // Cache static resources (CSS, JS, images)
    {
      urlPattern: /\.(?:js|css|webp|jpg|jpeg|png|svg|ico)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    // Cache font files
    {
      urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
        },
      },
    },
    // Cache HTML pages
    {
      urlPattern: /^https?:\/\/.*\/(?!api\/|_next\/|.*\.(?:js|css|webp|jpg|jpeg|png|svg|ico|woff|woff2|ttf|otf|eot)$).*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 10,
      },
    },
    // Cache everything else
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
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
