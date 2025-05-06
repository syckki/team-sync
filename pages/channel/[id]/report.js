import React from "react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import styled from "styled-components";
import Link from "next/link";
import ReportFormContainer from "../../../components/containers/ReportFormContainer";
import ReportViewer from "../../../components/containers/ReportViewer";
import { importKeyFromBase64, decryptData } from "../../../lib/cryptoUtils";
import { Card, Button, ErrorMessage, InfoMessage } from "../../../components/ui";

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
  max-width: 1240px;
`;

const BackLinkText = styled.span`
  display: inline-block;
  margin-top: 1rem;
  color: #4e7fff;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
`;

// Renamed to avoid conflict with imported ErrorMessage component
const StyledErrorMessage = styled.div`
  color: #e53e3e;
  padding: 0.75rem;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 4px;
  margin-bottom: 1rem;
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

const ReportPage = () => {
  const router = useRouter();
  const { id, view, index } = router.query;
  const isViewMode = view === "true";
  const messageIndex = index ? parseInt(index) : null;

  const [key, setKey] = useState(null);
  const [threadTitle, setThreadTitle] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamMemberOptions, setTeamMemberOptions] = useState([]);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Extract the key from URL fragment on mount
  useEffect(() => {
    if (!router.isReady) return;

    try {
      // Extract key from URL fragment (#)
      const fragment = window.location.hash.slice(1);

      if (!fragment) {
        setError(
          "No encryption key found. Please return to the thread and use the link provided there.",
        );
        return;
      }

      setKey(fragment);

      // Load team member options from localStorage if available
      try {
        const savedOptions = localStorage.getItem("teamMemberOptions");
        if (savedOptions) {
          setTeamMemberOptions(JSON.parse(savedOptions));
        }
      } catch (localStorageErr) {
        console.error("Error loading team member options:", localStorageErr);
        // Non-critical error, continue without saved options
      }
    } catch (err) {
      console.error("Error parsing key:", err);
      setError("Could not retrieve encryption key from URL.");
    }
  }, [router.isReady, isViewMode, id]);

  // Fetch thread title and specific message if messageIndex is provided
  useEffect(() => {
    if (key && id) {
      // Generate or retrieve author ID from localStorage
      let authorId = localStorage.getItem("encrypted-app-author-id");
      if (!authorId) {
        authorId = `author-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem("encrypted-app-author-id", authorId);
      }

      const loadReport = messageIndex !== null && !isViewMode;
      const messageParam = loadReport ? `&messageIndex=${messageIndex}` : "";

      // First fetch thread metadata
      fetch(`/api/download?threadId=${id}&authorId=${authorId}${messageParam}`)
        .then((response) => response.json())
        .then(async (data) => {
          setThreadTitle(data.threadTitle || id);
          setTeamName(data.threadTitle || id);

          if (loadReport) {
            const message = data.messages[0];

            if (!message.metadata?.isReport) return;

            const cryptoKey = await importKeyFromBase64(key);

            // Convert base64 data back to ArrayBuffer
            const encryptedBytes = Uint8Array.from(atob(message.data), (c) =>
              c.charCodeAt(0),
            );

            // Extract IV and ciphertext
            const iv = encryptedBytes.slice(0, 12);
            const ciphertext = encryptedBytes.slice(12);

            // Decrypt the data
            const decrypted = await decryptData(ciphertext, cryptoKey, iv);

            // Parse the decrypted JSON
            const parsedData = JSON.parse(new TextDecoder().decode(decrypted));

            // Set report data for editing
            setReportData(parsedData);

            // Set read-only mode based on report status
            setReadOnly(parsedData.status === "submitted");
          }
        })
        .catch((err) => {
          console.error("Error fetching thread data:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [key, id, messageIndex, isViewMode]);

  return (
    <>
      <Head>
        <title>
          {isViewMode
            ? "View AI Productivity Reports"
            : "Submit AI Productivity Report"}
        </title>
        <meta
          name="description"
          content="AI Productivity Reporting for Secure Teams"
        />
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
            AI Productivity Report
          </PageTitle>
          <PageSubtitle>
            Track and measure your productivity gains from using AI tools
          </PageSubtitle>
        </HeaderBanner>

        <ContentContainer>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          {isLoading ? (
            <LoadingMessage>Loading...</LoadingMessage>
          ) : (
            <>
              {isViewMode ? (
                <ReportViewer keyFragment={key} threadTitle={threadTitle} />
              ) : (
                <>
                  <ReportFormContainer
                    keyFragment={key}
                    teamName={teamName}
                    teamMemberOptions={teamMemberOptions}
                    reportData={reportData}
                    readOnly={readOnly}
                    messageIndex={messageIndex}
                  />
                </>
              )}
              <Link href={`/channel/${id}#${key}`}>
                <BackLinkText>← Back to Channel Inbox</BackLinkText>
              </Link>
            </>
          )}
        </ContentContainer>
      </Container>
    </>
  );
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps() {
  return {
    props: {},
  };
}

export default ReportPage;
