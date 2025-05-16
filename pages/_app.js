import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "../styles/globalStyles";
import { theme } from "../styles/theme";
import Layout from "../ui/Layout";
import Head from "next/head";
import XStateInspectorButton from "../ui/XStateInspectorButton";

const App = ({ Component, pageProps }) => {
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
        </Layout>
        <XStateInspectorButton />
      </ThemeProvider>
    </>
  );
};

export default App;
