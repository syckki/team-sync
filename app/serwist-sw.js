import { defaultCache } from '@serwist/next/app';

// Basic service worker configuration for the app
// This will be automatically picked up by Serwist
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Add a basic offline fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip cross-origin requests
  if (!request.url.match(self.location.origin)) {
    return;
  }
  
  // Handle document fallbacks
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/_offline'))
    );
  }
  
  // Handle image fallbacks
  else if (request.destination === 'image') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/icons/offline-image.svg'))
    );
  }
});