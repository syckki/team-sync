import React from 'react';
import styled from 'styled-components';
import NetworkStatusIndicator from './NetworkStatusIndicator';
import useNetworkStatus from '../hooks/useNetworkStatus';

const Main = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

// Styled component for the offline banner
const OfflineBanner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(231, 76, 60, 0.9);
  color: white;
  text-align: center;
  padding: 8px;
  font-size: 14px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

/**
 * Common layout component to be used across all pages
 * Includes network status indicator and other common UI elements
 */
const Layout = ({ children }) => {
  // Use the network status hook
  const { online } = useNetworkStatus();

  return (
    <Main>
      {!online && (
        <OfflineBanner>
          You're offline. Some features may be limited.
        </OfflineBanner>
      )}
      {children}
      <NetworkStatusIndicator />
    </Main>
  );
};

export default Layout;
