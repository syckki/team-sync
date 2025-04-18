import Head from "next/head";

const OfflinePage = () => {
  return (
    <>
      <Head>
        <title>Secure E2E Encryption - Offline</title>
      </Head>
      <h1>You are currently offline</h1>
      <h2>This secure application requires an internet connection for some features</h2>
      <p>Please check your connection and try again. Any messages you compose while offline will be queued and sent when you're back online.</p>
    </>
  );
};

export default OfflinePage;
