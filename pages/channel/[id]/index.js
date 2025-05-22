import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ChannelInboxViewModel from "../../../viewModels/ChannelInboxViewModel";
import Head from "next/head";
import styled from "styled-components";
import { Card, ContentContainer, ErrorMessage, PageHeader } from "../../../ui";
import { getAllParamsFromURL } from "../../../lib/cryptoUtils";

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ViewPage = () => {
  const [key, setKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    try {
      // Extract key from URL fragment (#)
      const { key } = getAllParamsFromURL(window.location.hash);

      // Handle the case where no key is provided in the URL
      if (!key) {
        router.push(`/channel/${id}/join`);
        return;
      }

      setKey(key);
    } catch (err) {
      console.error("Error parsing key from URL:", err);
      setError("Could not retrieve encryption key from URL. Make sure you have the complete link.");
    } finally {
      setIsLoading(false);
    }
  }, [router.isReady]);

  if (isLoading) {
    return <LoadingMessage>Loading encrypted content...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <>
      <Head>
        <title>Inbox | AI Productivity Tracker</title>
        <meta name="description" content="View an encrypted thread securely" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Card
        noPadding
        noPaddingHeader
        className="channel-container"
        style={{ maxWidth: "800px", margin: "0 auto 2rem auto" }}
      >
        <PageHeader
          title="Channel Inbox"
          subtitle="Collaborate securely with your team in this encrypted channel."
          showLock={true}
        />

        <ContentContainer>
          <ChannelInboxViewModel id={id} key64={key} />
        </ContentContainer>
      </Card>
    </>
  );
};

// These get called at build time
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps() {
  return {
    props: {
      pageProps: {},
    },
  };
}

export default ViewPage;
