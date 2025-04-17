import React from 'react';
import Head from 'next/head';
import styles from '../styles/Offline.module.css';
import { checkConnectivity } from '../lib/networkService';

const OfflinePage = () => {
  // Handler to try to reconnect and navigate back to home
  const tryReconnect = async () => {
    if (typeof window !== 'undefined') {
      // Try to check connectivity before navigating
      const isOnline = await checkConnectivity();
      
      if (isOnline) {
        window.location.href = '/';
      } else {
        // Add some visual feedback that we're still offline
        const button = document.getElementById('reconnect-button');
        if (button) {
          button.innerText = 'Still offline, try again';
          setTimeout(() => {
            button.innerText = 'Try to reconnect';
          }, 2000);
        }
      }
    }
  };

  return (
    <>
      <Head>
        <title>You are offline | SecureShare</title>
        <meta name="description" content="You are currently offline" />
      </Head>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.icon}>
            <span role="img" aria-label="offline">🔌</span>
          </div>
          <h1 className={styles.title}>You are offline</h1>
          <p className={styles.message}>
            Don't worry! Any messages you send while offline will be queued 
            and sent automatically when your connection is restored.
          </p>
          <p className={styles.message}>
            You can continue using previously loaded threads and create new
            encrypted content which will be synchronized later.
          </p>
          <button 
            id="reconnect-button"
            className={styles.button} 
            onClick={tryReconnect}
          >
            Try to reconnect
          </button>
        </div>
      </div>
    </>
  );
};

export default OfflinePage;
