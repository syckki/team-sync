/**
 * IndexedDB service for offline storage and queueing encrypted messages
 * This allows storing messages when offline for sending when connection is restored
 */

const DB_NAME = 'encrypted-messages-db';
const DB_VERSION = 1;
const MSG_QUEUE_STORE = 'message-queue';
const LOCAL_CACHE_STORE = 'local-cache';

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
