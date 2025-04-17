/**
 * Network status detection and management
 * Provides utilities for tracking online/offline status and testing network connectivity
 */

// Track whether the device is currently online
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

// Store callbacks to be notified of network status changes
const statusCallbacks = [];

/**
 * Initialize network status tracking
 * Sets up event listeners for online/offline events
 */
export const initNetworkTracking = () => {
  if (typeof window === 'undefined') return;
  
  // Set initial status
  isOnline = navigator.onLine;
  
  // Add event listeners
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  console.log(`Network tracking initialized. Current status: ${isOnline ? 'online' : 'offline'}`);
  
  // Run an initial connection test to verify actual connectivity
  testConnection().then(result => {
    if (isOnline !== result) {
      isOnline = result;
      notifyCallbacks(result);
    }
  });
};

/**
 * Clean up network tracking (remove event listeners)
 */
export const cleanupNetworkTracking = () => {
  if (typeof window === 'undefined') return;
  
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
};

/**
 * Handler for when the browser comes online
 */
const handleOnline = () => {
  isOnline = true;
  notifyCallbacks(true);
};

/**
 * Handler for when the browser goes offline
 */
const handleOffline = () => {
  isOnline = false;
  notifyCallbacks(false);
};

/**
 * Check if the device is currently online
 * @returns {boolean} True if online
 */
export const getIsOnline = () => isOnline;

/**
 * Register a callback to be notified of network status changes
 * @param {Function} callback - Function to call when status changes, receives boolean online status
 * @returns {Function} Unsubscribe function
 */
export const onNetworkStatusChange = (callback) => {
  statusCallbacks.push(callback);
  
  // Return function to unsubscribe
  return () => {
    const index = statusCallbacks.indexOf(callback);
    if (index !== -1) {
      statusCallbacks.splice(index, 1);
    }
  };
};

/**
 * Notify all registered callbacks of a network status change
 * @param {boolean} online - Current online status
 */
const notifyCallbacks = (online) => {
  statusCallbacks.forEach(callback => {
    try {
      callback(online);
    } catch (error) {
      console.error('Error in network status callback:', error);
    }
  });
};

/**
 * Test the connection by sending a small request to the server
 * @returns {Promise<boolean>} Promise resolving to true if connected
 */
export const testConnection = async () => {
  if (typeof window === 'undefined') return true;
  
  try {
    // Using a timestamp to prevent caching
    const response = await fetch(`/api/ping?_=${Date.now()}`, {
      method: 'HEAD',
      cache: 'no-cache',
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Auto-initialize if we're in the browser
if (typeof window !== 'undefined') {
  initNetworkTracking();
}