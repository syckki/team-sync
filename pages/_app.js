import { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import Head from 'next/head';

const theme = {
  colors: {
    primary: '#3498db',
    primaryDark: '#2980b9',
    secondary: '#2ecc71',
    secondaryDark: '#27ae60',
    background: '#ffffff',
    backgroundAlt: '#f8f9fa',
    backgroundHover: '#f0f0f0',
    text: '#333333',
    textLight: '#666666',
    border: '#ddd',
    error: '#e74c3c',
    errorBg: '#fdeded',
    success: '#2ecc71',
    successBg: '#effaf3',
    warning: '#f39c12',
    info: '#3498db',
    card: '#ffffff'
  },
  fonts: {
    main: 'Helvetica, Arial, sans-serif'
  },
  breakpoints: {
    mobile: '768px'
  }
};

function MyApp({ Component, pageProps }) {
  // PWA registration handling
  useEffect(() => {
    // Register Service Worker when running in the browser and in production
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleOnline = () => {
        console.log('App detected online status');
        // Dispatch custom event that components can listen for
        window.dispatchEvent(new Event('app-online'));
      };
      
      const handleOffline = () => {
        console.log('App detected offline status');
        // Dispatch custom event that components can listen for
        window.dispatchEvent(new Event('app-offline'));
      };
      
      // Register event listeners for online/offline status
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      // Log initial service worker registration
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          console.log('Service worker is active:', reg);
        });
      }
      
      // Cleanup
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no" />
        <meta name="theme-color" content="#3498db" />
        <meta name="description" content="End-to-end encrypted secure messaging with offline support" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />
        <title>SecureShare Encrypted Messaging</title>
      </Head>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp;
