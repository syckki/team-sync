/**
 * Network service for monitoring connection status and syncing offline data
 * This service handles online/offline detection and sync of queued messages
 */

import { getQueuedMessages, updateQueuedMessageStatus, removeQueuedMessage } from './dbService';

let isNetworkOnline = true;
const onlineCallbacks = [];
const offlineCallbacks = [];

/**
 * Initialize network monitoring
 * This sets up event listeners for online/offline events
 * @returns {boolean} Current online status
 */
export const initNetworkMonitoring = () => {
  if (typeof window === 'undefined') {
    return true; // SSR - assume online
  }

  // Check initial network state
  isNetworkOnline = window.navigator.onLine !== false; // Default to true if not explicitly false

  // Set up event listeners
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return isNetworkOnline;
};

/**
 * Get current network status
 * @returns {boolean} True if online, false if offline
 */
export const isOnline = () => {
  if (typeof window === 'undefined') {
    return true; // SSR - assume online
  }
  return isNetworkOnline;
};

/**
 * Handle online event
 */
const handleOnline = () => {
  console.log('Network connection restored');
  isNetworkOnline = true;
  
  // Notify all registered callbacks
  onlineCallbacks.forEach(callback => {
    try {
      callback();
    } catch (error) {
      console.error('Error in online callback:', error);
    }
  });
  
  // Try to sync queued messages
  syncQueuedMessages().then(results => {
    console.log('Sync results:', results);
  }).catch(error => {
    console.error('Error syncing messages:', error);
  });
  
  // Try to trigger service worker sync
  requestSync();
};

/**
 * Handle offline event
 */
const handleOffline = () => {
  console.log('Network connection lost');
  isNetworkOnline = false;
  
  // Notify all registered callbacks
  offlineCallbacks.forEach(callback => {
    try {
      callback();
    } catch (error) {
      console.error('Error in offline callback:', error);
    }
  });
};

/**
 * Register a callback for when the network comes online
 * @param {Function} callback - Function to call when online
 */
export const onOnline = (callback) => {
  if (typeof callback === 'function' && !onlineCallbacks.includes(callback)) {
    onlineCallbacks.push(callback);
  }
};

/**
 * Register a callback for when the network goes offline
 * @param {Function} callback - Function to call when offline
 */
export const onOffline = (callback) => {
  if (typeof callback === 'function' && !offlineCallbacks.includes(callback)) {
    offlineCallbacks.push(callback);
  }
};

/**
 * Remove a previously registered online callback
 * @param {Function} callback - The callback to remove
 */
export const removeOnlineCallback = (callback) => {
  const index = onlineCallbacks.indexOf(callback);
  if (index !== -1) {
    onlineCallbacks.splice(index, 1);
  }
};

/**
 * Remove a previously registered offline callback
 * @param {Function} callback - The callback to remove
 */
export const removeOfflineCallback = (callback) => {
  const index = offlineCallbacks.indexOf(callback);
  if (index !== -1) {
    offlineCallbacks.splice(index, 1);
  }
};

// Maintain a set of messages that are currently being synced
// This prevents duplicate sends during rapid online/offline transitions
const syncingMessages = new Set();

/**
 * Sync queued messages when online
 * @returns {Promise<Array>} Array of sync results
 */
export const syncQueuedMessages = async () => {
  if (!isOnline()) {
    console.log('Cannot sync - currently offline');
    return [];
  }

  try {
    // Get all queued messages that are not already in progress
    const queuedMessages = await getQueuedMessages();
    
    // Filter out any messages that are currently being synced
    const messagesToSync = queuedMessages.filter(msg => !syncingMessages.has(msg.id));
    
    if (messagesToSync.length === 0) {
      console.log('No eligible queued messages to sync');
      return [];
    }
    
    console.log(`Syncing ${messagesToSync.length} queued messages`);
    
    // Process each message
    const results = await Promise.all(messagesToSync.map(async (message) => {
      try {
        // Mark this message as being processed
        syncingMessages.add(message.id);
        
        // Update status to sending
        await updateQueuedMessageStatus(message.id, 'sending');
        
        // Determine the upload endpoint based on threadId
        const uploadEndpoint = message.threadId 
          ? `/api/upload?threadId=${message.threadId}` 
          : '/api/upload';
        
        // Send the message to the server
        const response = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-Author-ID': message.metadata.authorId || 'unknown'
          },
          body: message.data,
        });
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        
        // Message sent successfully
        console.log(`Successfully synced message ${message.id}`);
        
        // Get the response data
        const responseData = await response.json();
        
        // Remove the message from the queue
        await removeQueuedMessage(message.id);
        
        return {
          success: true,
          messageId: message.id,
          response: responseData
        };
      } catch (error) {
        console.error(`Error syncing message ${message.id}:`, error);
        
        // Update status to failed
        await updateQueuedMessageStatus(message.id, 'failed', message.attempts + 1);
        
        return {
          success: false,
          messageId: message.id,
          error: error.message
        };
      } finally {
        // Remove from processing set regardless of success/failure
        syncingMessages.delete(message.id);
      }
    }));
    
    // If any messages were synced successfully, trigger a refresh but with debounce
    const anySuccess = results.some(result => result.success);
    if (anySuccess) {
      // Only reload the page once all syncing is complete
      if (syncingMessages.size === 0) {
        setTimeout(() => {
          // Notify any listeners that messages were synced
          // This could be improved with a proper pub/sub system
          const syncEvent = new CustomEvent('messages-synced', { 
            detail: { results } 
          });
          window.dispatchEvent(syncEvent);
          
          // If we're on a thread view page, reload to show the updated messages
          if (window.location.pathname.startsWith('/view/')) {
            window.location.reload();
          }
        }, 500); // Wait a bit to handle multiple sync calls
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error syncing queued messages:', error);
    return [{ success: false, error: error.message }];
  }
};

/**
 * Register the service worker for PWA functionality
 */
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service workers are not supported in this browser');
    return false;
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register('/worker.js', {
      scope: '/',
    });
    
    console.log('Service Worker registered with scope:', registration.scope);
    
    // Set up message listener for service worker communication
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from Service Worker:', event.data);
      
      if (event.data && event.data.type === 'TRY_SYNC') {
        console.log('Received sync request from service worker');
        syncQueuedMessages();
      }
    });
    
    return true;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return false;
  }
};

/**
 * Request the service worker to sync messages
 */
export const requestSync = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    // Check if service worker is active before sending message
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SYNC_MESSAGES',
        timestamp: new Date().toISOString()
      });
      return true;
    } 
    
    return false;
  } catch (error) {
    console.error('Failed to request sync:', error);
    return false;
  }
};

// Initialize service worker when the module is imported
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
  
  // Register background sync when available
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      // Register for background sync if available
      registration.periodicSync.register('sync-messages', {
        minInterval: 60 * 1000, // Attempt to sync at least every minute
      }).catch(error => {
        console.log('Periodic Sync could not be registered:', error);
      });
      
      registration.sync.register('sync-messages').catch(error => {
        console.log('Background Sync could not be registered:', error);
      });
    });
  }
  
  // Clean up event listeners when module is unloaded
  if (typeof module !== 'undefined' && module.hot) {
    module.hot.dispose(() => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    });
  }
}
