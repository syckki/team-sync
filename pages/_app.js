import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "../styles/globalStyles";
import { theme } from "../styles/theme";
import Layout from "../ui/Layout";
import Head from "next/head";
import { useEffect, useState } from "react";
import setupInspector from "../lib/xstateInspector";
import dynamic from 'next/dynamic';

// Dynamically import the XStateInspectorButton with no SSR
// This prevents the button from being rendered during server-side rendering
const XStateInspectorButton = dynamic(
  () => import('../ui/XStateInspectorButton'),
  { ssr: false }
);

const App = ({ Component, pageProps }) => {
  const [showInspector, setShowInspector] = useState(false);
  
  // Initialize the XState inspector in development mode
  useEffect(() => {
    setupInspector();
    
    // Only show the inspector button in development mode
    if (process.env.NODE_ENV === 'development') {
      setShowInspector(true);
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="End-to-End Encrypted File Sharing" />
        <meta name="theme-color" content={theme.colors.primary} />
        <title>Secure E2E Encryption</title>
      </Head>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Layout>
          <Component {...pageProps} />
          {showInspector && <XStateInspectorButton />}
        </Layout>
      </ThemeProvider>
    </>
  );
};

export default App;
