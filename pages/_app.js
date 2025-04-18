import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from '../styles/globalStyles';
import { theme } from '../styles/theme';
import Layout from '../components/presentational/Layout';
import Head from 'next/head';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  // Handle service worker registration
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Serwist handles registration, but we want to log success/failure
        navigator.serviceWorker.ready
          .then((registration) => {
            console.log('Service Worker ready with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="End-to-End Encrypted File Sharing" />
        <meta name="theme-color" content={theme.colors.primary} />
        <title>Secure E2E Encryption</title>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
