/**
 * NetworkStatus - Utility for tracking and responding to network connectivity changes
 */

// Callback storage for network status change event handlers
const statusChangeCallbacks = [];

// Current network status
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

/**
 * Initialize network status tracking
 * Sets up event listeners for online/offline events
 */
export const initNetworkTracking = () => {
  if (typeof window === 'undefined') {
    return; // Skip if not in browser environment
  }
  
  // Set initial status
  isOnline = navigator.onLine;
  
  // Add event listeners for online/offline events
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  console.log(`Network tracking initialized. Current status: ${isOnline ? 'online' : 'offline'}`);
};

/**
 * Clean up network tracking (remove event listeners)
 */
export const cleanupNetworkTracking = () => {
  if (typeof window === 'undefined') {
    return;
  }
  
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
};

/**
 * Handler for when the browser comes online
 */
const handleOnline = () => {
  console.log('Network connection restored');
  isOnline = true;
  notifyStatusChange(true);
};

/**
 * Handler for when the browser goes offline
 */
const handleOffline = () => {
  console.log('Network connection lost');
  isOnline = false;
  notifyStatusChange(false);
};

/**
 * Check if the device is currently online
 * @returns {boolean} True if online
 */
export const getIsOnline = () => {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return isOnline; // Fallback to stored value if navigator not available
};

/**
 * Register a callback to be notified of network status changes
 * @param {Function} callback - Function to call when status changes, receives boolean online status
 * @returns {Function} Unsubscribe function
 */
export const onNetworkStatusChange = (callback) => {
  statusChangeCallbacks.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = statusChangeCallbacks.indexOf(callback);
    if (index !== -1) {
      statusChangeCallbacks.splice(index, 1);
    }
  };
};

/**
 * Notify all registered callbacks of a network status change
 * @param {boolean} online - Current online status
 */
const notifyStatusChange = (online) => {
  statusChangeCallbacks.forEach(callback => {
    try {
      callback(online);
    } catch (err) {
      console.error('Error in network status change callback:', err);
    }
  });
};

/**
 * Test the connection by sending a small request to the server
 * @returns {Promise<boolean>} Promise resolving to true if connected
 */
export const testConnection = async () => {
  if (!getIsOnline()) {
    return false; // Short circuit if browser reports as offline
  }
  
  try {
    // Use the API endpoint with a cache-busting query parameter
    const response = await fetch(`/api/ping?_=${Date.now()}`, { 
      method: 'HEAD',
      cache: 'no-store',
      timeout: 5000
    });
    
    return response.ok;
  } catch (error) {
    console.warn('Connection test failed:', error);
    return false;
  }
};