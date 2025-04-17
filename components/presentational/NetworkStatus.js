import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { getIsOnline, onNetworkStatusChange, testConnection } from '../../lib/networkStatus';
import { hasOfflineMessages, getOfflineQueue } from '../../lib/offlineQueue';
import { synchronizeOfflineMessages } from '../../lib/messageSync';

// Pulse animation for offline indicator
const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: ${props => props.online ? 'transparent' : 'rgba(255, 0, 0, 0.1)'};
  border-radius: 4px;
  margin-bottom: ${props => (props.online && !props.hasQueuedMessages) ? '0' : '1rem'};
  transition: all 0.3s ease;
  opacity: ${props => (props.online && !props.hasQueuedMessages) ? '0.7' : '1'};
  border: 1px solid ${props => props.online ? 'transparent' : '#f8d7da'};
  
  &:hover {
    opacity: 1;
  }
`;

const StatusIndicator = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.online ? '#28a745' : '#dc3545'};
  margin-right: 0.5rem;
  animation: ${props => props.online ? 'none' : pulse} 2s infinite ease-in-out;
`;

const StatusText = styled.span`
  font-size: 0.85rem;
  color: ${props => props.online ? '#28a745' : '#dc3545'};
  font-weight: ${props => props.online ? 'normal' : 'bold'};
`;

const QueuedMessageCount = styled.span`
  margin-left: 0.5rem;
  background-color: #ffc107;
  color: #212529;
  padding: 0.15rem 0.4rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: bold;
`;

const SyncButton = styled.button`
  margin-left: auto;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  
  &:hover {
    background-color: #0069d9;
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

/**
 * Network status indicator component
 * Shows online/offline status and offline message queue information
 */
const NetworkStatus = () => {
  const [online, setOnline] = useState(true);
  const [queuedMessages, setQueuedMessages] = useState([]);
  const [syncing, setSyncing] = useState(false);
  
  useEffect(() => {
    // Set initial status
    setOnline(getIsOnline());
    updateQueuedMessages();
    
    // Subscribe to network status changes
    const unsubscribe = onNetworkStatusChange((isOnline) => {
      setOnline(isOnline);
      updateQueuedMessages();
    });
    
    // Update queue status periodically
    const queueInterval = setInterval(() => {
      updateQueuedMessages();
    }, 5000);
    
    // Verify actual connection status on mount
    testConnection().then(setOnline);
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
      clearInterval(queueInterval);
    };
  }, []);
  
  // Update queued messages count
  const updateQueuedMessages = () => {
    setQueuedMessages(getOfflineQueue());
  };
  
  // Handle manual sync attempt
  const handleSync = async () => {
    if (syncing || !online) return;
    
    setSyncing(true);
    try {
      await synchronizeOfflineMessages();
      updateQueuedMessages();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };
  
  // Don't render anything if online with no queued messages
  if (online && queuedMessages.length === 0) {
    return null;
  }
  
  return (
    <StatusContainer 
      online={online} 
      hasQueuedMessages={queuedMessages.length > 0}
    >
      <StatusIndicator online={online} />
      <StatusText online={online}>
        {online ? 'Online' : 'Offline'}
        {queuedMessages.length > 0 && (
          <>
            {' - '}
            {queuedMessages.length} message{queuedMessages.length !== 1 ? 's' : ''} queued
          </>
        )}
      </StatusText>
      
      {queuedMessages.length > 0 && online && (
        <SyncButton 
          onClick={handleSync} 
          disabled={syncing}
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </SyncButton>
      )}
    </StatusContainer>
  );
};

export default NetworkStatus;