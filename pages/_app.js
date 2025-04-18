import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from '../styles/globalStyles';
import { theme } from '../styles/theme';
import Layout from '../components/presentational/Layout';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { initNetworkMonitoring, isOnline, syncQueuedMessages } from '../lib/networkService';

function MyApp({ Component, pageProps }) {
  const [networkStatus, setNetworkStatus] = useState(true); // Assume online initially
  
  useEffect(() => {
    // Initialize network monitoring
    const currentStatus = initNetworkMonitoring();
    setNetworkStatus(currentStatus);
    
    // Expose syncQueuedMessages to the window for offline.js to use
    window.syncQueuedMessages = syncQueuedMessages;
    
    // Listen for our custom online/offline events
    const handleOnlineEvent = () => setNetworkStatus(true);
    const handleOfflineEvent = () => setNetworkStatus(false);
    
    window.addEventListener('app-online', handleOnlineEvent);
    window.addEventListener('app-offline', handleOfflineEvent);
    
    // Load offline.js script
    const offlineScript = document.createElement('script');
    offlineScript.src = '/offline.js';
    offlineScript.async = true;
    document.body.appendChild(offlineScript);
    
    return () => {
      window.removeEventListener('app-online', handleOnlineEvent);
      window.removeEventListener('app-offline', handleOfflineEvent);
      if (offlineScript.parentNode) {
        offlineScript.parentNode.removeChild(offlineScript);
      }
    };
  }, []);
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="End-to-End Encrypted File Sharing" />
        <meta name="theme-color" content={theme.colors.primary} />
        <title>Secure E2E Encryption{!networkStatus ? ' (Offline)' : ''}</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider theme={{ ...theme, networkStatus }}>
        <GlobalStyles />
        <Layout>
          <Component {...pageProps} networkStatus={networkStatus} />
        </Layout>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
