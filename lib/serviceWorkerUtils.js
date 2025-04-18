/**
 * Service Worker communication utilities
 * These functions handle the communication between the app and the service worker
 * for caching thread data and managing offline functionality
 */
import { cacheThreadData, getCachedThreadData } from './dbService';

/**
 * Register service worker message listeners
 * This function should be called when the app starts
 */
export const initServiceWorkerListeners = () => {
  if (typeof window === 'undefined' || !navigator.serviceWorker) {
    return;
  }

  // Listen for messages from the service worker
  navigator.serviceWorker.addEventListener('message', async (event) => {
    if (!event.data) return;

    // Handle CACHE_THREAD messages from service worker
    if (event.data.type === 'CACHE_THREAD' && event.data.threadId) {
      try {
        console.log('[SW Utils] Service worker requested thread caching:', event.data.threadId);
        const response = await fetch(event.data.url);
        if (response.ok) {
          const data = await response.json();
          await cacheThreadData(event.data.threadId, data.messages || [], data.metadata || {});
          console.log('[SW Utils] Thread cached successfully:', event.data.threadId);
        }
      } catch (error) {
        console.error('[SW Utils] Error caching thread:', error);
      }
    }

    // Handle GET_CACHED_THREAD messages from service worker (includes message port)
    if (event.data.type === 'GET_CACHED_THREAD' && event.data.threadId && event.ports && event.ports[0]) {
      try {
        console.log('[SW Utils] Service worker requested cached thread:', event.data.threadId);
        const threadData = await getCachedThreadData(event.data.threadId);
        
        // Send the thread data back through the message port
        event.ports[0].postMessage({
          threadData: threadData 
            ? { 
                messages: threadData.messages || [], 
                metadata: threadData.metadata || {} 
              } 
            : null
        });
      } catch (error) {
        console.error('[SW Utils] Error retrieving cached thread:', error);
        event.ports[0].postMessage({ error: 'Failed to retrieve cached thread data' });
      }
    }
  });

  console.log('[SW Utils] Service worker message listeners initialized');
};

/**
 * Tell the service worker to skip waiting and activate
 * This is useful after a service worker update
 */
export const skipWaiting = () => {
  if (typeof window === 'undefined' || !navigator.serviceWorker) {
    return;
  }

  navigator.serviceWorker.ready.then(registration => {
    registration.active.postMessage({ type: 'SKIP_WAITING' });
  });
};

/**
 * Check if a service worker is registered and active
 * @returns {Promise<boolean>} True if service worker is active
 */
export const isServiceWorkerActive = async () => {
  if (typeof window === 'undefined' || !navigator.serviceWorker) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return !!registration.active;
  } catch (error) {
    console.error('[SW Utils] Error checking service worker:', error);
    return false;
  }
};

/**
 * Manually trigger caching of a thread for offline access
 * This function can be called when viewing a thread to ensure it's available offline
 * @param {string} threadId - The thread ID to cache
 * @param {Array} messages - The thread messages
 * @param {object} metadata - Thread metadata
 */
export const triggerThreadCaching = async (threadId, messages, metadata = {}) => {
  if (!threadId) return;
  
  try {
    await cacheThreadData(threadId, messages, metadata);
    console.log('[SW Utils] Manually triggered thread caching:', threadId);
  } catch (error) {
    console.error('[SW Utils] Error manually caching thread:', error);
  }
};

/**
 * Notify user they're offline with a toast or message
 * @param {boolean} isOffline - Whether the user is offline
 */
export const notifyOfflineStatus = (isOffline) => {
  if (typeof window === 'undefined') return;
  
  if (isOffline) {
    console.log('[SW Utils] User is offline - activating offline mode');
    // Add a subtle offline indicator to the page
    const existingIndicator = document.getElementById('offline-indicator');
    if (!existingIndicator) {
      const indicator = document.createElement('div');
      indicator.id = 'offline-indicator';
      indicator.innerHTML = 'Offline Mode';
      indicator.style.position = 'fixed';
      indicator.style.bottom = '10px';
      indicator.style.right = '10px';
      indicator.style.backgroundColor = '#f97316';
      indicator.style.color = 'white';
      indicator.style.padding = '8px 12px';
      indicator.style.borderRadius = '4px';
      indicator.style.fontSize = '14px';
      indicator.style.fontWeight = 'bold';
      indicator.style.zIndex = '9999';
      indicator.style.opacity = '0.9';
      document.body.appendChild(indicator);
    }
  } else {
    console.log('[SW Utils] User is back online');
    // Remove the offline indicator if it exists
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.remove();
    }
  }
};
