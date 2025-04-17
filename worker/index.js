// Custom service worker for offline support

// This service worker can be customized
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Listen for sync event - used for background sync when connections are restored
// Note: This event will only fire in browsers that support Background Sync API
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

// Function to handle syncing of queued messages
async function syncMessages() {
  const clients = await self.clients.matchAll();
  
  // Send sync event to all open windows
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_MESSAGES'
    });
  });
}

// Add a custom fetch handler for API calls
self.addEventListener('fetch', (event) => {
  // Only handle API requests
  if (event.request.url.includes('/api/') && 
      !event.request.url.includes('/api/ping')) {
    
    // If offline, respond with an appropriate error
    if (!navigator.onLine) {
      event.respondWith(
        new Response(JSON.stringify({
          success: false,
          error: 'You are currently offline. Your message will be sent when you reconnect.'
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }
  }
});