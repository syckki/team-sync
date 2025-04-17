/**
 * OfflineQueue - Manages message queuing for offline functionality
 * Allows users to compose messages offline and automatically syncs them 
 * when connection is restored
 */

// Storage key for the offline message queue
const OFFLINE_QUEUE_KEY = 'encrypted-app-offline-queue';

/**
 * Add a message to the offline queue
 * @param {Object} message - Message object with all data needed to send when online
 * @returns {Object} Added message with queue ID
 */
export const addToOfflineQueue = (message) => {
  // Get existing queue from localStorage
  const queue = getOfflineQueue();
  
  // Add unique queue ID and timestamp to message
  const queuedMessage = {
    ...message,
    queueId: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
    queuedAt: new Date().toISOString(),
    attempts: 0
  };
  
  // Add message to queue
  queue.push(queuedMessage);
  
  // Save updated queue
  saveOfflineQueue(queue);
  
  return queuedMessage;
};

/**
 * Remove a message from the offline queue by its queue ID
 * @param {string} queueId - Unique queue ID of the message to remove
 * @returns {boolean} Success status
 */
export const removeFromOfflineQueue = (queueId) => {
  const queue = getOfflineQueue();
  const initialLength = queue.length;
  
  // Filter out the message with the matching queue ID
  const updatedQueue = queue.filter(msg => msg.queueId !== queueId);
  
  // Save the updated queue
  saveOfflineQueue(updatedQueue);
  
  // Return success status (true if a message was removed)
  return updatedQueue.length < initialLength;
};

/**
 * Update a message in the offline queue
 * @param {string} queueId - Queue ID of the message to update
 * @param {Object} updates - Object with properties to update
 * @returns {Object|null} Updated message or null if not found
 */
export const updateQueuedMessage = (queueId, updates) => {
  const queue = getOfflineQueue();
  let updatedMessage = null;
  
  // Map through queue and update the matching message
  const updatedQueue = queue.map(msg => {
    if (msg.queueId === queueId) {
      updatedMessage = { ...msg, ...updates };
      return updatedMessage;
    }
    return msg;
  });
  
  // Save updated queue
  saveOfflineQueue(updatedQueue);
  
  return updatedMessage;
};

/**
 * Get all messages in the offline queue
 * @returns {Array} Array of queued messages
 */
export const getOfflineQueue = () => {
  try {
    const queueJson = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Error retrieving offline queue:', error);
    return [];
  }
};

/**
 * Save the offline queue to localStorage
 * @param {Array} queue - Array of queued messages
 */
const saveOfflineQueue = (queue) => {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving offline queue:', error);
  }
};

/**
 * Check if there are any messages in the offline queue
 * @returns {boolean} True if queue has messages
 */
export const hasOfflineMessages = () => {
  return getOfflineQueue().length > 0;
};

/**
 * Clear all messages from the offline queue
 */
export const clearOfflineQueue = () => {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
};

/**
 * Increment the attempt counter for a queued message
 * @param {string} queueId - Queue ID of the message
 * @returns {Object|null} Updated message or null if not found
 */
export const incrementAttemptCounter = (queueId) => {
  const queue = getOfflineQueue();
  const message = queue.find(msg => msg.queueId === queueId);
  
  if (!message) {
    return null;
  }
  
  return updateQueuedMessage(queueId, { 
    attempts: (message.attempts || 0) + 1,
    lastAttempt: new Date().toISOString()
  });
};