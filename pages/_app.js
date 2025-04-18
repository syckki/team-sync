import { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from '../styles/globalStyles';
import { theme } from '../styles/theme';
import Layout from '../components/presentational/Layout';
import Head from 'next/head';
import styled from 'styled-components';

// For offline notification
const OfflineNotice = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 8px 16px;
  text-align: center;
  background-color: #fff3cd;
  color: #856404;
  z-index: 9999;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s, opacity 0.3s;
  transform: ${props => props.$visible ? 'translateY(0)' : 'translateY(-100%)'};
  opacity: ${props => props.$visible ? '1' : '0'};
`;

// For install prompt
const InstallPrompt = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background-color: #3498db;
  color: white;
  z-index: 9999;
  display: ${props => props.$visible ? 'flex' : 'none'};
  justify-content: space-between;
  align-items: center;
`;

const InstallButton = styled.button`
  background-color: white;
  color: #3498db;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 16px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  opacity: 0.8;
  
  &:hover {
    opacity: 1;
  }
`;

function MyApp({ Component, pageProps }) {
  // Network status state
  const [isOffline, setIsOffline] = useState(false);
  
  // For PWA install prompt
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  
  // Check online status on component mount
  useEffect(() => {
    // Set initial state
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      
      // Add event listeners for online/offline events
      const handleOnline = () => {
        setIsOffline(false);
        // Try to sync any queued messages
        if (typeof window.syncQueuedMessages === 'function') {
          window.syncQueuedMessages();
        }
      };
      
      const handleOffline = () => {
        setIsOffline(true);
      };
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      // Capture the install prompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        setInstallPrompt(e);
        // Show the install prompt after a delay
        setTimeout(() => {
          // Only show if not already installed
          if (!window.matchMedia('(display-mode: standalone)').matches) {
            setShowInstallPrompt(true);
          }
        }, 5000); // Show after 5 seconds
      });
      
      // Return the cleanup function
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);
  
  // Handle install button click
  const handleInstallClick = () => {
    if (installPrompt) {
      // Show the prompt
      installPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        // Reset the install prompt variable
        setInstallPrompt(null);
        setShowInstallPrompt(false);
      });
    }
  };
  
  // Close the install prompt
  const closeInstallPrompt = () => {
    setShowInstallPrompt(false);
  };
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="End-to-End Encrypted Secure Messaging with Offline Support" />
        <meta name="theme-color" content="#3498db" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <title>SecureShare - E2E Encryption</title>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </Head>
      
      {/* Offline notification */}
      <OfflineNotice $visible={isOffline}>
        📶 You are currently offline. Messages will be queued and sent when you're back online.
      </OfflineNotice>
      
      {/* Install prompt banner */}
      <InstallPrompt $visible={showInstallPrompt}>
        <div>Install SecureShare for better offline access</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <InstallButton onClick={handleInstallClick}>Install</InstallButton>
          <CloseButton onClick={closeInstallPrompt}>✕</CloseButton>
        </div>
      </InstallPrompt>
      
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Layout>
          <Component {...pageProps} isOffline={isOffline} />
        </Layout>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
