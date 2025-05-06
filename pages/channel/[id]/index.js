import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import DecryptionContainer from "../../../components/containers/DecryptionContainer";
import Head from "next/head";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
  max-width: 800px;
`;

const HeaderBanner = styled.div`
  background-color: hsl(217 91% 60%);
  color: white;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  color: white;
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.5rem;
  letter-spacing: -0.025em;
  font-weight: 500;
  display: flex;
  align-items: center;

  /* Reduce size on mobile devices */
  @media (max-width: 576px) {
    font-size: 1rem;
    line-height: 1.3rem;
  }
`;

const LockIcon = styled.div`
  width: 1.25rem;
  height: auto;
  margin-right: 0.5rem;
  display: inline-flex;

  /* Reduce size on mobile devices */
  @media (max-width: 576px) {
    width: 1rem;
    margin-right: 0.15rem;
  }
`;

const PageSubtitle = styled.p`
  margin: 0;
  margin-top: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgb(255 255 255 / 0.9);

  /* Adjust size on mobile devices */
  @media (max-width: 576px) {
    font-size: 0.8rem;
    line-height: 1.1rem;
    margin-top: 0.25rem;
  }
`;

const ContentContainer = styled.div`
  padding: 0 2rem 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem 1.5rem;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.colors.errorBg};
  border-radius: 8px;
  margin-top: 2rem;
`;

const ViewPage = ({ pageProps }) => {
  const [key, setKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    try {
      // Extract key from URL fragment (#)
      const fragment = window.location.hash.slice(1);

      // Handle the case where no key is provided in the URL
      if (!fragment) {
        router.push(`/channel/${id}/join`);
        setIsLoading(false);
        return;
      }

      setKey(fragment);
      setIsLoading(false);
    } catch (err) {
      console.error("Error parsing key from URL:", err);
      setError(
        "Could not retrieve encryption key from URL. Make sure you have the complete link.",
      );
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

      <Container>
        <HeaderBanner>
          <PageTitle>
            <LockIcon>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </LockIcon>
            Channel Inbox
          </PageTitle>
          <PageSubtitle>
            Collaborate securely with your team in this encrypted channel.
          </PageSubtitle>
        </HeaderBanner>

        <ContentContainer>
          <DecryptionContainer id={id} key64={key} />
        </ContentContainer>
      </Container>
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
