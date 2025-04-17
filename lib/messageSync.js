/**
 * MessageSync - Handles the synchronization of offline messages when connectivity is restored
 */

import { getIsOnline, onNetworkStatusChange } from './networkStatus';
import { 
  getOfflineQueue, 
  removeFromOfflineQueue, 
  incrementAttemptCounter, 
  getRetryableMessages, 
  clearOfflineQueue,
  addToOfflineQueue
} from './offlineQueue';

// Minimum delay between synchronization attempts in milliseconds
const MIN_SYNC_DELAY = 5000;
let lastSyncAttempt = 0;
let syncInProgress = false;
let syncServiceWorkerRegistered = false;

/**
 * Initialize the message sync manager
 * Sets up network status change handlers and periodic sync checking
 */
export const initMessageSyncManager = () => {
  if (typeof window === 'undefined') return;
  
  console.log('Message sync manager initialized');
  
  // Register for network status changes to trigger sync when we come online
  onNetworkStatusChange((online) => {
    if (online) {
      synchronizeOfflineMessages();
    }
  });
  
  // Check for and register background sync if available
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      // Listen for sync message from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_MESSAGES') {
          synchronizeOfflineMessages();
        }
      });
      
      // Only try to register sync if SyncManager is available
      if ('sync' in registration && 'SyncManager' in window) {
        try {
          registration.sync.register('sync-messages')
            .then(() => {
              syncServiceWorkerRegistered = true;
              console.log('Background sync registered successfully');
            })
            .catch(err => {
              console.log('Background sync registration failed, falling back to polling:', err);
            });
        } catch (err) {
          console.log('Background sync API error, falling back to polling:', err);
        }
      } else {
        console.log('Background Sync API not available, using polling for offline sync');
      }
    }).catch(err => {
      console.error('Service worker ready promise failed:', err);
    });
  } else {
    console.log('Service Worker not supported in this browser, using polling for offline sync');
  }
  
  // Periodically check for offline messages to sync
  setInterval(() => {
    if (getIsOnline() && getOfflineQueue().length > 0) {
      synchronizeOfflineMessages();
    }
  }, 60000); // Check every minute
  
  // Attempt initial sync on load
  if (getIsOnline()) {
    setTimeout(() => {
      synchronizeOfflineMessages();
    }, 1000);
  }
};

/**
 * Synchronize all pending offline messages with the server
 * @returns {Promise<Array>} Array of results for each message
 */
export const synchronizeOfflineMessages = async () => {
  // If sync is already in progress or we're offline, bail out
  if (syncInProgress || !getIsOnline()) {
    return [];
  }
  
  // Check if we've synced recently to avoid spamming
  const now = Date.now();
  if (now - lastSyncAttempt < MIN_SYNC_DELAY) {
    return [];
  }
  
  lastSyncAttempt = now;
  syncInProgress = true;
  
  try {
    const messagesToSync = getRetryableMessages();
    
    if (messagesToSync.length === 0) {
      console.log('No offline messages to sync');
      syncInProgress = false;
      return [];
    }
    
    console.log(`Syncing ${messagesToSync.length} offline messages...`);
    
    // Process messages in sequence
    const results = [];
    for (const message of messagesToSync) {
      try {
        // Attempt to send the message
        let result;
        
        // Check message type and handle accordingly
        if (message.type === 'new-message') {
          // Send new message to API
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              encryptedData: message.encryptedData,
              threadId: message.threadId,
              metadata: message.metadata
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
          }
          
          result = await response.json();
          
          // If successful, remove from queue
          removeFromOfflineQueue(message.queueId);
        } else {
          console.warn(`Unknown message type: ${message.type}`);
          // Remove unknown message types to avoid cluttering the queue
          removeFromOfflineQueue(message.queueId);
        }
        
        results.push({ success: true, message, result });
      } catch (error) {
        console.error(`Failed to sync message ${message.queueId}:`, error);
        
        // Increment attempt counter
        incrementAttemptCounter(message.queueId);
        
        results.push({ success: false, message, error: error.message });
      }
    }
    
    console.log(`Sync completed. ${results.filter(r => r.success).length}/${results.length} messages successfully synced.`);
    return results;
  } catch (error) {
    console.error('Message synchronization failed:', error);
    return [];
  } finally {
    syncInProgress = false;
  }
};

/**
 * Queue a message for delivery when online
 * If online, attempts to send immediately
 * @param {Object} messageData - The message data to send
 * @returns {Promise<Object>} Result of the operation
 */
export const queueOrSendMessage = async (messageData) => {
  // Try to send immediately if online
  if (getIsOnline()) {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      return {
        success: true,
        offline: false,
        data: await response.json()
      };
    } catch (error) {
      // If sending fails, fall back to offline queue
      console.log('Failed to send message, queuing for later:', error);
    }
  }
  
  // If we're offline or sending failed, add to offline queue
  const queuedMessage = addToOfflineQueue({
    ...messageData,
    type: 'new-message',
    timestamp: Date.now(),
  });
  
  // Register for background sync if available
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // Only try to register sync if it's available and was registered successfully before
      if (syncServiceWorkerRegistered && 'sync' in registration && 'SyncManager' in window) {
        await registration.sync.register('sync-messages')
          .catch(err => {
            console.log('Background sync registration failed in queueOrSendMessage:', err);
          });
      }
    } catch (err) {
      console.log('Service worker not ready in queueOrSendMessage:', err);
    }
  }
  
  return {
    success: true,
    offline: true,
    queuedMessage
  };
};

// Initialize if we're in the browser
if (typeof window !== 'undefined') {
  initMessageSyncManager();
}