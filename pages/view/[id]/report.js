import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

// Use dynamic import with SSR disabled to avoid hydration issues with window access
const ReportContainer = dynamic(() => import("../../../components/containers/ReportContainer"), { ssr: false });

/**
 * Report Page - Displays productivity reports for a thread
 */
const ReportPage = () => {
  return (
    <>
      <Head>
        <title>AI Productivity Report | Encrypted App</title>
        <meta name="description" content="View and submit AI productivity reports" />
      </Head>
      
      <ReportContainer />
    </>
  );
};

// Use getStaticPaths to define the paths that should be pre-rendered at build time
export async function getStaticPaths() {
  return {
    paths: [], // No pre-rendered paths
    fallback: 'blocking', // Generate on-demand if not found
  };
}

// Use getStaticProps to provide props to the page at build time
export async function getStaticProps() {
  return {
    props: {}
  };
}

export default ReportPage;