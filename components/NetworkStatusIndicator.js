import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { isOnline, onOnline, onOffline } from '../lib/networkService';

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

const Container = styled.div`
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 1000;
  transition: all 0.3s ease;
  transform: ${props => props.$visible ? 'translateY(0)' : 'translateY(100px)'};
  opacity: ${props => props.$visible ? '1' : '0'};
`;

const StatusPill = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: ${props => props.$online ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)'};
  color: white;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: ${props => props.$online ? 'none' : `${pulse} 2s infinite ease-in-out`};
  backdrop-filter: blur(4px);
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.$online ? 'white' : 'white'};
  margin-right: 8px;
`;

const NetworkStatusIndicator = () => {
  const [online, setOnline] = useState(true);
  const [visible, setVisible] = useState(false);
  const [hideTimeout, setHideTimeout] = useState(null);

  // Show indicator for 5 seconds when status changes, or permanently when offline
  const showTemporarily = (isOnlineStatus) => {
    setVisible(true);
    
    // Clear any existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    
    // If online, hide after delay. If offline, keep visible
    if (isOnlineStatus) {
      const timeout = setTimeout(() => {
        setVisible(false);
      }, 5000);
      setHideTimeout(timeout);
    }
  };

  useEffect(() => {
    // Initialize with current status
    const currentStatus = isOnline();
    setOnline(currentStatus);
    setVisible(!currentStatus); // Only show if offline initially
    
    // Set up listeners for online/offline events
    const handleOnline = () => {
      setOnline(true);
      showTemporarily(true);
    };
    
    const handleOffline = () => {
      setOnline(false);
      showTemporarily(false);
    };
    
    onOnline(handleOnline);
    onOffline(handleOffline);
    
    // Clean up listeners
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, []);

  return (
    <Container $visible={visible}>
      <StatusPill $online={online}>
        <StatusDot $online={online} />
        {online ? 'Online' : 'Offline Mode'}
      </StatusPill>
    </Container>
  );
};

export default NetworkStatusIndicator;
