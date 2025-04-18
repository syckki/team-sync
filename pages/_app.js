import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from '../styles/globalStyles';
import { theme } from '../styles/theme';
import Layout from '../components/presentational/Layout';
import Head from 'next/head';
import { initServiceWorkerListeners, notifyOfflineStatus } from '../lib/serviceWorkerUtils';
import { isOnline, initNetworkMonitoring, onOnline, onOffline } from '../lib/networkService';

function MyApp({ Component, pageProps }) {
  const [isOffline, setIsOffline] = useState(false);
  
  useEffect(() => {
    // Initialize service worker listeners for offline support
    if (typeof window !== 'undefined') {
      // Initialize the service worker listeners
      initServiceWorkerListeners();
      
      // Initialize network monitoring
      const currentOnlineStatus = initNetworkMonitoring();
      setIsOffline(!currentOnlineStatus);
      
      // Set up handlers for online/offline events
      const handleOnline = () => {
        setIsOffline(false);
        notifyOfflineStatus(false);
      };
      
      const handleOffline = () => {
        setIsOffline(true);
        notifyOfflineStatus(true);
      };
      
      // Register the handlers
      onOnline(handleOnline);
      onOffline(handleOffline);
      
      // Initial offline status check
      notifyOfflineStatus(!currentOnlineStatus);
      
      // Clean up event listeners on component unmount
      return () => {
        // The network service has functions to remove the callbacks
        // when the component is unmounted
        onOnline(handleOnline, true);  // true to remove
        onOffline(handleOffline, true);  // true to remove
      };
    }
  }, []);
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="End-to-End Encrypted Messaging with Offline Support" />
        <meta name="theme-color" content={theme.colors.primary} />
        <title>SecureShare E2E Encryption</title>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </Head>
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
