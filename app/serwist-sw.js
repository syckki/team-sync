/**
 * This is the service worker for the application
 * It handles caching and offline support
 * Following Serwist's official documentation
 */

// The array will be automatically filled with
// resources to be precached by the Serwist plugin
self.__SW_MANIFEST;

// Skip waiting phase
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Take control of all clients as soon as the service worker activates
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