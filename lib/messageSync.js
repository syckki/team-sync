/**
 * MessageSync - Handles the synchronization of offline messages when connectivity is restored
 */
import { 
  getOfflineQueue, 
  removeFromOfflineQueue,
  incrementAttemptCounter,
  updateQueuedMessage
} from './offlineQueue';
import { onNetworkStatusChange, getIsOnline, testConnection } from './networkStatus';

// Maximum number of sync attempts per message
const MAX_SYNC_ATTEMPTS = 3;

// Delay between retries in ms (3 seconds)
const RETRY_DELAY = 3000;

// Sync in progress flag
let isSyncing = false;

// Sync manager state
let syncManagerInitialized = false;

/**
 * Initialize the message sync manager
 * Sets up network status change handlers and periodic sync checking
 */
export const initMessageSyncManager = () => {
  if (syncManagerInitialized || typeof window === 'undefined') {
    return;
  }
  
  // Set up network status change listener
  onNetworkStatusChange((online) => {
    if (online) {
      console.log('Network restored, checking for offline messages...');
      synchronizeOfflineMessages();
    }
  });
  
  // Set up periodic sync checking in case network events don't fire correctly
  // This will run every 30 seconds to check for unsent messages if we're online
  setInterval(() => {
    if (getIsOnline()) {
      synchronizeOfflineMessages();
    }
  }, 30000);
  
  // Do an initial sync check if we're online
  if (getIsOnline()) {
    // Small delay to ensure everything is loaded
    setTimeout(() => {
      synchronizeOfflineMessages();
    }, 1000);
  }
  
  syncManagerInitialized = true;
  console.log('Message sync manager initialized');
};

/**
 * Synchronize all pending offline messages with the server
 * @returns {Promise<Array>} Array of results for each message
 */
export const synchronizeOfflineMessages = async () => {
  // Prevent multiple syncs from running at once
  if (isSyncing) {
    console.log('Sync already in progress, skipping');
    return [];
  }
  
  // Double-check we're actually online
  const isConnected = await testConnection();
  if (!isConnected) {
    console.log('Not connected, aborting sync');
    return [];
  }
  
  try {
    isSyncing = true;
    const queue = getOfflineQueue();
    
    if (queue.length === 0) {
      console.log('No offline messages to sync');
      return [];
    }
    
    console.log(`Syncing ${queue.length} offline messages...`);
    
    // Process each queued message
    const results = await Promise.all(
      queue.map(async (message) => {
        try {
          // Skip messages that exceeded max retry attempts
          if (message.attempts >= MAX_SYNC_ATTEMPTS) {
            console.warn(`Message ${message.queueId} exceeded maximum retry attempts`);
            return { 
              success: false, 
              queueId: message.queueId, 
              error: 'Maximum retry attempts exceeded',
              permanent: true
            };
          }
          
          // Track sync attempt
          incrementAttemptCounter(message.queueId);
          
          // Prepare message data for sending
          const { combinedData, threadId, authorId } = message.data;
          
          // Determine upload endpoint
          const uploadEndpoint = threadId ? 
            `/api/upload?threadId=${threadId}` : 
            '/api/upload';
          
          // Send the message to the server
          const response = await fetch(uploadEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
              'X-Author-ID': authorId
            },
            body: combinedData,
          });
          
          if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }
          
          // Parse response
          const responseData = await response.json();
          
          // Message synced successfully, remove from queue
          removeFromOfflineQueue(message.queueId);
          
          return { 
            success: true, 
            queueId: message.queueId, 
            serverResponse: responseData 
          };
        } catch (error) {
          console.error(`Error syncing message ${message.queueId}:`, error);
          
          // Update message status
          updateQueuedMessage(message.queueId, { 
            lastError: error.message,
            lastErrorAt: new Date().toISOString()
          });
          
          // If it's not a network error, we might want to retry later
          const isPermanentFailure = !error.message.includes('network') && 
                                    !error.message.includes('fetch');
          
          return { 
            success: false, 
            queueId: message.queueId, 
            error: error.message,
            permanent: isPermanentFailure
          };
        }
      })
    );
    
    const successCount = results.filter(r => r.success).length;
    console.log(`Sync completed. ${successCount} of ${queue.length} messages synced successfully.`);
    
    // For temporary failures, schedule a retry
    const temporaryFailures = results.filter(r => !r.success && !r.permanent);
    if (temporaryFailures.length > 0) {
      console.log(`Scheduling retry for ${temporaryFailures.length} messages in ${RETRY_DELAY}ms`);
      setTimeout(() => {
        synchronizeOfflineMessages();
      }, RETRY_DELAY);
    }
    
    return results;
  } finally {
    isSyncing = false;
  }
};

/**
 * Queue a message for delivery when online
 * If online, attempts to send immediately
 * @param {Object} messageData - The message data to send
 * @returns {Promise<Object>} Result of the operation
 */
export const queueOrSendMessage = async (messageData) => {
  const isConnected = await testConnection();
  
  if (isConnected) {
    // We're online, try to send directly
    try {
      const { combinedData, threadId, authorId } = messageData;
      
      // Determine upload endpoint
      const uploadEndpoint = threadId ? 
        `/api/upload?threadId=${threadId}` : 
        '/api/upload';
      
      // Send the message to the server
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Author-ID': authorId
        },
        body: combinedData,
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      return { 
        success: true, 
        online: true,
        queued: false,
        response: responseData
      };
    } catch (error) {
      // If sending fails, fall back to offline queue
      console.warn('Failed to send message directly, queuing for later:', error);
    }
  }
  
  // We're offline or sending failed, add to queue
  import('./offlineQueue').then(({ addToOfflineQueue }) => {
    addToOfflineQueue({
      data: messageData,
      type: 'message',
      timestamp: new Date().toISOString()
    });
  });
  
  return {
    success: true,
    online: false,
    queued: true,
    queuedAt: new Date().toISOString()
  };
};