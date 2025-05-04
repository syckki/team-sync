import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  max-width: 100%;
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #4e7fff;
`;

const ModalText = styled.p`
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  color: #333;
`;

const DismissButton = styled.button`
  background-color: #4e7fff;
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3d6bf3;
  }
`;

const DeviceIcon = styled.div`
  margin: 0 auto 1rem;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4e7fff;
`;

/**
 * Component that shows a warning modal on extremely narrow screens
 * @param {number} minWidth - Minimum width in pixels before showing warning
 */
const MinWidthWarning = ({ minWidth = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasUserDismissed, setHasUserDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the warning
    const dismissed = localStorage.getItem('min-width-warning-dismissed');
    if (dismissed) {
      setHasUserDismissed(true);
    }
    
    // Function to check window width
    const checkWidth = () => {
      if (window.innerWidth < minWidth && !hasUserDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Initial check
    checkWidth();
    
    // Listen for resize events
    window.addEventListener('resize', checkWidth);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkWidth);
  }, [minWidth, hasUserDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setHasUserDismissed(true);
    localStorage.setItem('min-width-warning-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <DeviceIcon>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12" y2="18"></line>
          </svg>
        </DeviceIcon>
        <ModalTitle>Screen Too Narrow</ModalTitle>
        <ModalText>
          This application requires a minimum screen width of {minWidth}px for optimal viewing.
          Please rotate your device to landscape mode or use a device with a larger screen.
        </ModalText>
        <DismissButton onClick={handleDismiss}>
          Continue Anyway
        </DismissButton>
      </ModalContent>
    </ModalOverlay>
  );
};

// Export with noSSR to prevent hydration issues
export default dynamic(() => Promise.resolve(MinWidthWarning), { 
  ssr: false 
});