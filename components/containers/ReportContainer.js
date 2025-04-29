import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import ReportForm from "./ReportForm";
import ReportViewer from "./ReportViewer";
import { importKeyFromBase64, decryptData } from "../../lib/cryptoUtils";

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 1rem;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: ${({ active }) => (active ? "#4e7fff" : "#64748b")};
  border-bottom: 2px solid
    ${({ active }) => (active ? "#4e7fff" : "transparent")};
  transition: all 0.2s;

  &:hover {
    color: ${({ active }) => (active ? "#4e7fff" : "#1e293b")};
  }
`;

const ErrorMessage = styled.div`
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #f87171;
`;

const SuccessMessage = styled.div`
  background-color: #ecfdf5;
  color: #065f46;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #34d399;
`;

/**
 * ReportContainer Component - Manages the report form and viewer
 */
const ReportContainer = () => {
  const router = useRouter();
  const { id } = router.query;
  
  // State variables
  const [activeTab, setActiveTab] = useState("submit");
  const [keyValue, setKeyValue] = useState("");
  const [cryptoKey, setCryptoKey] = useState(null);
  const [threadTitle, setThreadTitle] = useState("");
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Check if we're in view-only mode or if "view" is specified in the query
  const isViewMode = router.pathname.includes("/view") || router.query.view === "true";
  
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

      setKeyValue(fragment);

      // Import the crypto key
      importKeyFromBase64(fragment)
        .then((importedKey) => {
          setCryptoKey(importedKey);
          
          // If in view mode, fetch thread metadata to get title
          fetchThreadMetadata(id);
        })
        .catch((err) => {
          console.error("Error importing key:", err);
          setError("Invalid encryption key format.");
        });
    } catch (err) {
      console.error("Error parsing key:", err);
      setError("Could not retrieve encryption key from URL.");
    } finally {
      setIsLoading(false);
    }
  }, [router.isReady, id]);
  
  // Fetch thread metadata to get the title
  const fetchThreadMetadata = async (threadId) => {
    try {
      const response = await fetch(`/api/thread-meta?threadId=${threadId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch thread metadata");
      }
      
      const data = await response.json();
      
      if (data && data.title) {
        setThreadTitle(data.title);
      }
    } catch (err) {
      console.error("Error fetching thread metadata:", err);
      // Non-critical error, continue with empty title
    }
  };
  
  // Handle form submission success
  const handleSubmitSuccess = () => {
    setSuccess("Report submitted successfully!");
    setTimeout(() => {
      setActiveTab("view");
      setSuccess(null);
    }, 2000);
  };
  
  // Handle submission error
  const handleSubmitError = (errorMsg) => {
    setError(errorMsg);
    setTimeout(() => {
      setError(null);
    }, 5000);
  };
  
  if (isLoading) {
    return (
      <Container>
        <div>Loading...</div>
      </Container>
    );
  }
  
  if (error && !success) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
        {keyValue && (
          <button onClick={() => setError(null)}>Try Again</button>
        )}
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <Title>AI Productivity Report</Title>
        <Subtitle>
          Track and analyze how AI tools are improving your team's productivity
        </Subtitle>
      </Header>
      
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      {!isViewMode && (
        <Tabs>
          <Tab
            active={activeTab === "submit"}
            onClick={() => setActiveTab("submit")}
          >
            Submit Report
          </Tab>
          <Tab
            active={activeTab === "view"}
            onClick={() => setActiveTab("view")}
          >
            View Reports
          </Tab>
        </Tabs>
      )}
      
      {(activeTab === "submit" && !isViewMode) ? (
        <ReportForm
          threadId={id}
          threadTitle={threadTitle}
          cryptoKey={cryptoKey}
          onSubmitSuccess={handleSubmitSuccess}
          onError={handleSubmitError}
        />
      ) : (
        <ReportViewer
          threadId={id}
          keyValue={keyValue}
          threadTitle={threadTitle}
        />
      )}
    </Container>
  );
};

export default ReportContainer;