import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
          
          {/* PWA Meta Tags */}
          <meta name="application-name" content="End-to-End Encrypted Messaging" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="E2E Crypto" />
          <meta name="description" content="Secure end-to-end encrypted messaging with offline capabilities" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#3498db" />
          
          {/* PWA Icons and Manifest */}
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" href="/icons/icon-192x192.svg" type="image/svg+xml" />
          <link rel="alternate icon" href="/icons/icon-192x192.png" type="image/png" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          
          {/* Apple-specific PWA Icons */}
          <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-touch-fullscreen" content="yes" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
