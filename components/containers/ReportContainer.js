import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import styled from "styled-components";
import ReportForm from "./ReportForm";
import ReportViewer from "./ReportViewer";
import { importKeyFromBase64, decryptData } from "../../lib/cryptoUtils";

// Styled components
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
`;

const LockIcon = styled.div`
  width: 1.25rem;
  height: auto;
  margin-right: 0.5rem;
  display: inline-flex;
`;

const PageSubtitle = styled.p`
  margin: 0;
  margin-top: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgb(255 255 255 / 0.9);
`;

const ContentContainer = styled.div`
  padding: 0 2rem 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem 1.5rem;
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  padding: 0.75rem;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  color: #38a169;
  padding: 0.75rem;
  background-color: #f0fff4;
  border: 1px solid #c6f6d5;
  border-radius: 4px;
  margin-bottom: 1rem;
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

/**
 * ReportContainer - The main container for the report page
 * Handles routing, mode detection, and encryption key management
 */
const ReportContainer = () => {
  const router = useRouter();
  const { id, view } = router.query;
  const isViewMode = view === "true";

  const [key, setKey] = useState(null);
  const [cryptoKey, setCryptoKey] = useState(null);
  const [threadTitle, setThreadTitle] = useState("");
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Extract the key from URL fragment on mount
  useEffect(() => {
    if (!router.isReady) return;

    try {
      // Extract key from URL fragment (#)
      const fragment = window.location.hash.slice(1);

      if (!fragment) {
        setError(
          "No encryption key found. Please return to the thread and use the link provided there."
        );
        return;
      }

      setKey(fragment);

      // If in view mode, fetch the reports
      if (isViewMode) {
        fetchReports(fragment);
      }
    } catch (err) {
      console.error("Error parsing key:", err);
      setError("Could not retrieve encryption key from URL.");
    } finally {
      setIsLoading(false);
    }
  }, [router.isReady, isViewMode, id]);

  // Fetch thread title when key is available
  useEffect(() => {
    if (key && id) {
      const authorId = localStorage.getItem("encrypted-app-author-id");
      if (authorId) {
        fetch(`/api/download?threadId=${id}&authorId=${authorId}`)
          .then((response) => response.json())
          .then((data) => {
            setThreadTitle(data.threadTitle || id);
          })
          .catch((err) => {
            console.error("Error fetching thread data:", err);
          });
      }
    }
  }, [key, id]);

  // Import the crypto key for use in child components
  useEffect(() => {
    if (key) {
      importKeyFromBase64(key)
        .then((importedKey) => {
          setCryptoKey(importedKey);
        })
        .catch((err) => {
          console.error("Error importing crypto key:", err);
          setError("Failed to process encryption key.");
        });
    }
  }, [key]);

  const fetchReports = async (keyValue) => {
    try {
      setIsLoading(true);

      // Get author ID from localStorage
      const authorId = localStorage.getItem("encrypted-app-author-id");
      if (!authorId) {
        throw new Error(
          "Author ID not found. Please go back to the thread view."
        );
      }

      // Fetch all messages from the thread
      const response = await fetch(
        `/api/download?threadId=${id}&authorId=${authorId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch thread data");
      }

      const threadData = await response.json();

      // Import the key from fragment
      const cryptoKey = await importKeyFromBase64(keyValue);

      // Filter and decrypt reports
      const decryptedReports = [];

      for (const message of threadData.messages) {
        // Check if this message is marked as a report in metadata
        if (message.metadata && message.metadata.isReport) {
          try {
            // Convert base64 data back to ArrayBuffer
            const encryptedBytes = Uint8Array.from(atob(message.data), (c) =>
              c.charCodeAt(0)
            );

            // Extract IV and ciphertext
            const iv = encryptedBytes.slice(0, 12);
            const ciphertext = encryptedBytes.slice(12);

            // Decrypt the data
            const decrypted = await decryptData(ciphertext, cryptoKey, iv);

            // Parse the decrypted JSON
            const content = JSON.parse(new TextDecoder().decode(decrypted));

            decryptedReports.push({
              id: message.index,
              timestamp: message.metadata.timestamp || new Date().toISOString(),
              authorId: message.metadata.authorId,
              isCurrentUser: message.metadata.authorId === authorId,
              ...content,
            });
          } catch (err) {
            console.error("Error decrypting report:", err);
          }
        }
      }

      // Sort reports by timestamp, newest first
      decryptedReports.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setReports(decryptedReports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(`Failed to load reports: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for when a report is successfully submitted
  const handleReportSubmitted = () => {
    setSuccess(true);
    
    // Refresh the reports if in view mode
    if (isViewMode) {
      fetchReports(key);
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      setSuccess(false);
    }, 5000);
  };

  if (isLoading) {
    return (
      <Container>
        <p>Loading...</p>
      </Container>
    );
  }

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
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </LockIcon>
            {isViewMode ? "AI Productivity Reports" : "Submit AI Productivity Report"}
          </PageTitle>
          <PageSubtitle>
            {isViewMode
              ? `Viewing reports for ${threadTitle}`
              : `New report for ${threadTitle}`}
          </PageSubtitle>
        </HeaderBanner>

        <ContentContainer>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && (
            <SuccessMessage>
              Your AI productivity report has been submitted successfully!
            </SuccessMessage>
          )}

          {isViewMode ? (
            // View mode - show report viewer
            <ReportViewer 
              reports={reports} 
              threadTitle={threadTitle} 
              isLoading={isLoading}
            />
          ) : (
            // Edit mode - show report form
            <ReportForm
              threadId={id}
              threadTitle={threadTitle}
              cryptoKey={cryptoKey}
              onSubmitSuccess={handleReportSubmitted}
              onError={setError}
            />
          )}

          <div>
            <BackLinkText onClick={() => router.back()}>
              ← Back to thread
            </BackLinkText>
          </div>
        </ContentContainer>
      </Container>
    </>
  );
};

export default ReportContainer;