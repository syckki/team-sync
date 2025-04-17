import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from '../styles/globalStyles';
import { theme } from '../styles/theme';
import Layout from '../components/presentational/Layout';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { syncQueuedMessages } from '../lib/networkService';

function MyApp({ Component, pageProps }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  
  useEffect(() => {
    // Check initial network status
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      
      // Setup event listeners for online/offline
      const handleOnline = () => {
        setIsOnline(true);
        // Try to sync queued messages when we come back online
        setTimeout(() => {
          syncQueuedMessages();
        }, 1000);
      };
      
      const handleOffline = () => {
        setIsOnline(false);
      };
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      // PWA installation detection
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsPWAInstalled(true);
      }
      
      // Detect PWA install
      window.addEventListener('appinstalled', () => {
        setIsPWAInstalled(true);
      });
      
      // Cleanup
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);
  
  // Enhanced SW registration to handle custom update flows
  useEffect(() => {
    // Register service worker update handler
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // When a new service worker is available, we can notify the user
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker activated');
      });
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from service worker:', event.data);
        
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Cache has been updated with:', event.data.payload.resources);
        }
      });
    }
  }, []);
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="description" content="End-to-End Encrypted File Sharing with Offline Support" />
        <meta name="theme-color" content={theme.colors.primary} />
        <title>Secure E2E Encryption</title>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/generated-icon.png" />
      </Head>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Layout>
          {/* Add a banner when offline */}
          {!isOnline && (
            <div style={{
              background: '#fff3cd',
              color: '#856404',
              padding: '0.5rem',
              textAlign: 'center',
              borderBottom: '1px solid #ffeeba',
              fontWeight: 'bold'
            }}>
              You are currently offline. Some features may be limited.
            </div>
          )}
          
          <Component {...pageProps} isOnline={isOnline} isPWAInstalled={isPWAInstalled} />
        </Layout>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
