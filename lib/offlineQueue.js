/**
 * Offline message queue management
 * Handles storing and retrieving messages when the device is offline
 */

const QUEUE_STORAGE_KEY = 'e2e-offline-message-queue';
const MAX_ATTEMPTS = 3; // Maximum number of retry attempts for a message

// In-memory storage for the offline queue
let offlineQueue = [];

// Load the queue from localStorage on initialization
if (typeof localStorage !== 'undefined') {
  try {
    const savedQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (savedQueue) {
      offlineQueue = JSON.parse(savedQueue);
    }
  } catch (error) {
    console.error('Error loading offline queue from storage:', error);
  }
}

/**
 * Add a message to the offline queue
 * @param {Object} message - Message object with all data needed to send when online
 * @returns {Object} Added message with queue ID
 */
export const addToOfflineQueue = (message) => {
  // Generate a unique queue ID
  const queueId = `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create queue entry with metadata
  const queueEntry = {
    ...message,
    queueId,
    timestamp: Date.now(),
    attempts: 0,
    lastAttempt: null
  };
  
  // Add to queue
  offlineQueue.push(queueEntry);
  
  // Save to persistent storage
  saveQueueToStorage();
  
  return queueEntry;
};

/**
 * Remove a message from the offline queue by its queue ID
 * @param {string} queueId - Unique queue ID of the message to remove
 * @returns {boolean} Success status
 */
export const removeFromOfflineQueue = (queueId) => {
  const initialLength = offlineQueue.length;
  offlineQueue = offlineQueue.filter(item => item.queueId !== queueId);
  
  // If an item was removed, save the updated queue
  if (initialLength !== offlineQueue.length) {
    saveQueueToStorage();
    return true;
  }
  
  return false;
};

/**
 * Update a message in the offline queue
 * @param {string} queueId - Queue ID of the message to update
 * @param {Object} updates - Object with properties to update
 * @returns {Object|null} Updated message or null if not found
 */
export const updateQueuedMessage = (queueId, updates) => {
  const index = offlineQueue.findIndex(item => item.queueId === queueId);
  
  if (index === -1) {
    return null;
  }
  
  // Update the message
  offlineQueue[index] = {
    ...offlineQueue[index],
    ...updates
  };
  
  // Save updated queue
  saveQueueToStorage();
  
  return offlineQueue[index];
};

/**
 * Get all messages in the offline queue
 * @returns {Array} Array of queued messages
 */
export const getOfflineQueue = () => {
  return [...offlineQueue];
};

/**
 * Save the offline queue to localStorage
 * @param {Array} queue - Array of queued messages
 */
const saveQueueToStorage = () => {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(offlineQueue));
    } catch (error) {
      console.error('Error saving offline queue to storage:', error);
    }
  }
};

/**
 * Check if there are any messages in the offline queue
 * @returns {boolean} True if queue has messages
 */
export const hasOfflineMessages = () => {
  return offlineQueue.length > 0;
};

/**
 * Clear all messages from the offline queue
 */
export const clearOfflineQueue = () => {
  offlineQueue = [];
  saveQueueToStorage();
};

/**
 * Increment the attempt counter for a queued message
 * @param {string} queueId - Queue ID of the message
 * @returns {Object|null} Updated message or null if not found
 */
export const incrementAttemptCounter = (queueId) => {
  return updateQueuedMessage(queueId, {
    attempts: (offlineQueue.find(m => m.queueId === queueId)?.attempts || 0) + 1,
    lastAttempt: Date.now()
  });
};

/**
 * Get all messages that have not exceeded the maximum retry attempts
 * @returns {Array} Array of messages that can still be retried
 */
export const getRetryableMessages = () => {
  return offlineQueue.filter(message => message.attempts < MAX_ATTEMPTS);
};

/**
 * Get all messages that have exceeded the maximum retry attempts
 * @returns {Array} Array of failed messages
 */
export const getFailedMessages = () => {
  return offlineQueue.filter(message => message.attempts >= MAX_ATTEMPTS);
};