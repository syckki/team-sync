import React from "react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import styled from "styled-components";
import Link from "next/link";
import ReportFormViewModel from "../../../viewModels/ReportFormViewModel";
import ReportViewerViewModel from "../../../viewModels/ReportViewerViewModel";
import { importKeyFromBase64, decryptData } from "../../../lib/cryptoUtils";
import { Card, ErrorMessage, ContentContainer, PageHeader } from "../../../ui";

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

// Using shared components from the UI library

// Using ContentContainer from UI components

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
            setReadOnly(data.isCreator || parsedData.status === "submitted");
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

      <Card
        noPadding
        noPaddingHeader
        className="report-container"
        style={{ maxWidth: "1240px", margin: "0 auto 2rem auto" }}
      >
        <PageHeader
          title="AI Productivity Report"
          subtitle="Track and measure your productivity gains from using AI tools"
          showLock={true}
        />

        <ContentContainer>
          {error && <ErrorMessage type="error">{error}</ErrorMessage>}

          {isLoading ? (
            <LoadingMessage>Loading...</LoadingMessage>
          ) : (
            <>
              {isViewMode ? (
                <ReportViewerViewModel
                  keyFragment={key}
                  threadTitle={threadTitle}
                />
              ) : (
                <>
                  <ReportFormViewModel
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
      </Card>
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
