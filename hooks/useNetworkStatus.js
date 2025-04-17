import { useState, useEffect } from 'react';
import { isOnline, onOnline, onOffline, removeOnlineCallback, removeOfflineCallback } from '../lib/networkService';

/**
 * Custom React hook for monitoring network status
 * 
 * @returns {Object} Network status state and functions
 * @property {boolean} online Current online status
 */
export default function useNetworkStatus() {
  const [online, setOnline] = useState(true);
  
  useEffect(() => {
    // Set initial state from network service
    setOnline(isOnline());
    
    const handleOnlineEvent = () => {
      setOnline(true);
      console.log('Network connection restored (hook)');
    };
    
    const handleOfflineEvent = () => {
      setOnline(false);
      console.log('Network connection lost (hook)');
    };
    
    // Register callbacks with the network service
    onOnline(handleOnlineEvent);
    onOffline(handleOfflineEvent);
    
    // Clean up on unmount
    return () => {
      removeOnlineCallback(handleOnlineEvent);
      removeOfflineCallback(handleOfflineEvent);
    };
  }, []);
  
  return {
    online
  };
}
