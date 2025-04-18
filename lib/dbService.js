/**
 * IndexedDB service for offline storage and queueing encrypted messages
 * This allows storing messages when offline for sending when connection is restored
 * and caching thread data for offline access
 */

const DB_NAME = 'encrypted-messages-db';
const DB_VERSION = 2; // Increased version for new thread store
const MSG_QUEUE_STORE = 'message-queue';
const LOCAL_CACHE_STORE = 'local-cache';
const THREAD_CACHE_STORE = 'thread-cache';
const OFFLINE_THREADS_STORE = 'secure-share-cache';

// Open the IndexedDB database
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(new Error('Error opening database'));
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const oldVersion = event.oldVersion;

      // Create object store for queued messages
      if (!db.objectStoreNames.contains(MSG_QUEUE_STORE)) {
        const store = db.createObjectStore(MSG_QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('threadId', 'threadId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('Created message queue store');
      }

      // Create object store for local cached data
      if (!db.objectStoreNames.contains(LOCAL_CACHE_STORE)) {
        const cacheStore = db.createObjectStore(LOCAL_CACHE_STORE, { keyPath: 'key' });
        cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('Created local cache store');
      }
      
      // Create object store for thread cache (added in version 2)
      if (oldVersion < 2 && !db.objectStoreNames.contains(THREAD_CACHE_STORE)) {
        const threadStore = db.createObjectStore(THREAD_CACHE_STORE, { keyPath: 'threadId' });
        threadStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        threadStore.createIndex('createdAt', 'createdAt', { unique: false });
        console.log('Created thread cache store');
      }
    };
  });
};

/**
 * Queue an encrypted message for later sending when online
 * @param {string|null} threadId - The thread ID (null for new threads)
 * @param {Uint8Array} encryptedData - The encrypted message data
 * @param {object} metadata - Optional metadata about the message
 * @returns {Promise<number>} The ID of the queued message
 */
export const queueMessage = async (threadId, encryptedData, metadata = {}) => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([MSG_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(MSG_QUEUE_STORE);

    // Create a payload that can be stored in IndexedDB
    // ArrayBuffers need special handling
    const dataToStore = {
      threadId,
      data: Array.from(encryptedData), // Convert Uint8Array to regular array for storage
      metadata,
      timestamp: new Date().toISOString(),
      attempts: 0,
      status: 'queued'
    };

    return new Promise((resolve, reject) => {
      const request = store.add(dataToStore);
      
      request.onsuccess = (event) => {
        console.log('Message queued successfully with ID:', event.target.result);
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        console.error('Error queueing message:', event.target.error);
        reject(new Error('Failed to queue message'));
      };
    });
  } catch (error) {
    console.error('Queue message error:', error);
    throw error;
  }
};

/**
 * Get all queued messages
 * @returns {Promise<Array>} Array of queued messages
 */
export const getQueuedMessages = async () => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([MSG_QUEUE_STORE], 'readonly');
    const store = transaction.objectStore(MSG_QUEUE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = (event) => {
        const messages = event.target.result.map(msg => ({
          ...msg,
          data: new Uint8Array(msg.data) // Convert back to Uint8Array
        }));
        resolve(messages);
      };
      
      request.onerror = (event) => {
        console.error('Error getting queued messages:', event.target.error);
        reject(new Error('Failed to get queued messages'));
      };
    });
  } catch (error) {
    console.error('Get queued messages error:', error);
    throw error;
  }
};

/**
 * Update a queued message's status
 * @param {number} id - The ID of the queued message
 * @param {string} status - The new status ('queued', 'sending', 'sent', 'failed')
 * @param {number} attempts - Number of attempts to send
 * @returns {Promise<boolean>} Success indicator
 */
export const updateQueuedMessageStatus = async (id, status, attempts = null) => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([MSG_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(MSG_QUEUE_STORE);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      
      getRequest.onsuccess = (event) => {
        const message = event.target.result;
        if (!message) {
          reject(new Error(`Message with ID ${id} not found`));
          return;
        }

        message.status = status;
        if (attempts !== null) {
          message.attempts = attempts;
        } else {
          message.attempts++;
        }
        message.lastUpdated = new Date().toISOString();

        const updateRequest = store.put(message);
        
        updateRequest.onsuccess = () => {
          resolve(true);
        };
        
        updateRequest.onerror = (event) => {
          console.error('Error updating message status:', event.target.error);
          reject(new Error('Failed to update message status'));
        };
      };
      
      getRequest.onerror = (event) => {
        console.error('Error fetching message:', event.target.error);
        reject(new Error('Failed to fetch message'));
      };
    });
  } catch (error) {
    console.error('Update message status error:', error);
    throw error;
  }
};

/**
 * Remove a message from the queue
 * @param {number} id - The ID of the queued message
 * @returns {Promise<boolean>} Success indicator
 */
export const removeQueuedMessage = async (id) => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([MSG_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(MSG_QUEUE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('Error removing message:', event.target.error);
        reject(new Error('Failed to remove message'));
      };
    });
  } catch (error) {
    console.error('Remove message error:', error);
    throw error;
  }
};

/**
 * Store data in the local cache
 * @param {string} key - Unique identifier for the cached data
 * @param {any} data - Data to cache
 * @returns {Promise<boolean>} Success indicator
 */
export const cacheData = async (key, data) => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([LOCAL_CACHE_STORE], 'readwrite');
    const store = transaction.objectStore(LOCAL_CACHE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.put({
        key,
        data,
        timestamp: new Date().toISOString()
      });
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('Error caching data:', event.target.error);
        reject(new Error('Failed to cache data'));
      };
    });
  } catch (error) {
    console.error('Cache data error:', error);
    throw error;
  }
};

/**
 * Retrieve data from the local cache
 * @param {string} key - The key of the cached data
 * @returns {Promise<any>} The cached data
 */
export const getCachedData = async (key) => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([LOCAL_CACHE_STORE], 'readonly');
    const store = transaction.objectStore(LOCAL_CACHE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      
      request.onsuccess = (event) => {
        const result = event.target.result;
        resolve(result ? result.data : null);
      };
      
      request.onerror = (event) => {
        console.error('Error getting cached data:', event.target.error);
        reject(new Error('Failed to get cached data'));
      };
    });
  } catch (error) {
    console.error('Get cached data error:', error);
    throw error;
  }
};

/**
 * Clear all messages from the queue
 * @returns {Promise<boolean>} Success indicator
 */
export const clearMessageQueue = async () => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([MSG_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(MSG_QUEUE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('Error clearing message queue:', event.target.error);
        reject(new Error('Failed to clear message queue'));
      };
    });
  } catch (error) {
    console.error('Clear message queue error:', error);
    throw error;
  }
};

/**
 * Cache a thread's data for offline access
 * @param {string} threadId - The thread ID
 * @param {Array} messages - Array of thread messages
 * @param {object} metadata - Thread metadata (title, creator, etc.)
 * @returns {Promise<boolean>} Success indicator
 */
export const cacheThreadData = async (threadId, messages, metadata = {}) => {
  try {
    if (!threadId) {
      console.error('Cannot cache thread: threadId is required');
      return false;
    }

    const db = await openDatabase();
    const transaction = db.transaction([THREAD_CACHE_STORE], 'readwrite');
    const store = transaction.objectStore(THREAD_CACHE_STORE);
    
    // Prepare messages for storage (convert ArrayBuffer/Uint8Array to regular arrays)
    const processedMessages = messages.map(msg => {
      // If the message contains encrypted content that might be a Uint8Array
      if (msg.encryptedContent && msg.encryptedContent instanceof Uint8Array) {
        return {
          ...msg,
          encryptedContent: Array.from(msg.encryptedContent)
        };
      }
      
      // Handle messages that have already been decrypted and have content
      if (msg.content && typeof msg.content === 'object') {
        return {
          ...msg,
          // No need to process content as it's already JSON serializable
        };
      }
      
      return msg;
    });

    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      // First check if this thread is already cached
      const getRequest = store.get(threadId);
      
      getRequest.onsuccess = (event) => {
        const existingData = event.target.result;
        
        const threadData = {
          threadId,
          messages: processedMessages,
          metadata,
          lastAccessed: now,
          createdAt: existingData ? existingData.createdAt : now,
          updatedAt: now
        };
        
        const putRequest = store.put(threadData);
        
        putRequest.onsuccess = () => {
          // Also update the offline threads store for the offline page
          // This is a separate database that just tracks available threads
          try {
            const offlineDb = indexedDB.open('secure-share-cache', 1);
            
            offlineDb.onupgradeneeded = (e) => {
              const db = e.target.result;
              if (!db.objectStoreNames.contains('threads')) {
                db.createObjectStore('threads', { keyPath: 'threadId' });
              }
            };
            
            offlineDb.onsuccess = (e) => {
              const db = e.target.result;
              const tx = db.transaction(['threads'], 'readwrite');
              const threadsStore = tx.objectStore('threads');
              
              threadsStore.put({
                threadId,
                title: metadata.title || `Thread ${threadId.substring(threadId.length - 8)}`,
                lastAccessed: now
              });
            };
          } catch (err) {
            console.error('Error updating offline threads store:', err);
            // Don't reject the promise if this fails, as the main caching was successful
          }
          
          resolve(true);
        };
        
        putRequest.onerror = (event) => {
          console.error('Error caching thread data:', event.target.error);
          reject(new Error('Failed to cache thread data'));
        };
      };
      
      getRequest.onerror = (event) => {
        console.error('Error checking for existing thread cache:', event.target.error);
        reject(new Error('Failed to check for existing thread'));
      };
    });
  } catch (error) {
    console.error('Cache thread data error:', error);
    return false;
  }
};

/**
 * Get cached thread data for offline access
 * @param {string} threadId - The thread ID
 * @returns {Promise<object|null>} Thread data including messages and metadata
 */
export const getCachedThreadData = async (threadId) => {
  try {
    if (!threadId) {
      return null;
    }

    const db = await openDatabase();
    const transaction = db.transaction([THREAD_CACHE_STORE], 'readonly');
    const store = transaction.objectStore(THREAD_CACHE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(threadId);
      
      request.onsuccess = (event) => {
        const result = event.target.result;
        
        if (!result) {
          resolve(null);
          return;
        }
        
        // Update the access timestamp
        try {
          const updateTx = db.transaction([THREAD_CACHE_STORE], 'readwrite');
          const updateStore = updateTx.objectStore(THREAD_CACHE_STORE);
          result.lastAccessed = new Date().toISOString();
          updateStore.put(result);
        } catch (e) {
          console.error('Error updating thread access time:', e);
          // Non-critical error, continue with the data we have
        }
        
        // Process messages to convert arrays back to Uint8Arrays where needed
        const processedMessages = result.messages.map(msg => {
          if (msg.encryptedContent && Array.isArray(msg.encryptedContent)) {
            return {
              ...msg,
              encryptedContent: new Uint8Array(msg.encryptedContent)
            };
          }
          return msg;
        });
        
        resolve({
          ...result,
          messages: processedMessages
        });
      };
      
      request.onerror = (event) => {
        console.error('Error getting cached thread:', event.target.error);
        reject(new Error('Failed to get cached thread'));
      };
    });
  } catch (error) {
    console.error('Get cached thread error:', error);
    return null;
  }
};

/**
 * Get all cached threads (for offline access listing)
 * @returns {Promise<Array>} Array of cached thread metadata
 */
export const getAllCachedThreads = async () => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([THREAD_CACHE_STORE], 'readonly');
    const store = transaction.objectStore(THREAD_CACHE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = (event) => {
        const threads = event.target.result.map(thread => ({
          threadId: thread.threadId,
          metadata: thread.metadata,
          lastAccessed: thread.lastAccessed,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          messageCount: thread.messages ? thread.messages.length : 0
        }));
        
        resolve(threads);
      };
      
      request.onerror = (event) => {
        console.error('Error getting all cached threads:', event.target.error);
        reject(new Error('Failed to get cached threads'));
      };
    });
  } catch (error) {
    console.error('Get all cached threads error:', error);
    return [];
  }
};

/**
 * Remove a cached thread
 * @param {string} threadId - The thread ID to remove from cache
 * @returns {Promise<boolean>} Success indicator
 */
export const removeCachedThread = async (threadId) => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([THREAD_CACHE_STORE], 'readwrite');
    const store = transaction.objectStore(THREAD_CACHE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.delete(threadId);
      
      request.onsuccess = () => {
        // Also remove from the offline threads store
        try {
          const offlineDb = indexedDB.open('secure-share-cache', 1);
          
          offlineDb.onsuccess = (e) => {
            const db = e.target.result;
            const tx = db.transaction(['threads'], 'readwrite');
            const threadsStore = tx.objectStore('threads');
            threadsStore.delete(threadId);
          };
        } catch (err) {
          console.error('Error removing from offline threads store:', err);
          // Don't reject the promise for this secondary operation
        }
        
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error('Error removing cached thread:', event.target.error);
        reject(new Error('Failed to remove cached thread'));
      };
    });
  } catch (error) {
    console.error('Remove cached thread error:', error);
    return false;
  }
};
