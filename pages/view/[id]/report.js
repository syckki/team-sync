import React from "react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import styled from "styled-components";
import Link from "next/link";
import ReportForm from "../../../components/containers/ReportForm";
import ReportViewer from "../../../components/containers/ReportViewer";
import useReportData from "../../../hooks/useReportData";
import useReportForm from "../../../hooks/useReportForm";

// Styled components for layout
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

const ReportFormContainer = styled.form`
  margin-bottom: 1.5rem;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  padding: 0.75rem;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const ReportPage = () => {
  const router = useRouter();
  const { id, view } = router.query;
  const isViewMode = view === "true";

  const [key, setKey] = useState(null);
  const {
    reports,
    threadTitle, 
    teamName,
    setThreadTitle,
    setTeamName,
    isLoading,
    error: dataError,
    setError: setDataError,
    fetchReports
  } = useReportData(id, key);

  const {
    teamMember,
    setTeamMember,
    teamMemberOptions,
    setTeamMemberOptions,
    teamRole,
    setTeamRole,
    rows,
    setRows,
    expandedRows,
    setExpandedRows,
    handleSubmit,
    isSubmitting,
    error: formError,
    setError: setFormError,
    success,
    setSuccess
  } = useReportForm(id, key);

  // Extract the key from URL fragment on mount
  useEffect(() => {
    if (!router.isReady) return;

    try {
      // Extract key from URL fragment (#)
      const fragment = window.location.hash.slice(1);

      if (!fragment) {
        setDataError(
          "No encryption key found. Please return to the thread and use the link provided there."
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

      // If in view mode, fetch the reports
      if (isViewMode) {
        fetchReports(fragment);
      }
    } catch (err) {
      console.error("Error parsing key:", err);
      setDataError("Could not retrieve encryption key from URL.");
    }
  }, [router.isReady, isViewMode, id]);

  if (isLoading) {
    return (
      <Container>
        <HeaderBanner>
          <PageTitle>
            <LockIcon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </LockIcon>
            AI Productivity Report
          </PageTitle>
          <PageSubtitle>Loading your encrypted data...</PageSubtitle>
        </HeaderBanner>
        <ContentContainer>
          <p>Loading...</p>
        </ContentContainer>
      </Container>
    );
  }

  // If there's a dataError, display it
  if (dataError) {
    return (
      <Container>
        <HeaderBanner>
          <PageTitle>
            <LockIcon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </LockIcon>
            AI Productivity Report
          </PageTitle>
          <PageSubtitle>Error</PageSubtitle>
        </HeaderBanner>
        <ContentContainer>
          <ErrorMessage>{dataError}</ErrorMessage>
          <Link href={`/view/${id}`} legacyBehavior={false}>
            Return to thread
          </Link>
        </ContentContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Head>
        <title>AI Productivity Report - {threadTitle}</title>
      </Head>
      <HeaderBanner>
        <PageTitle>
          <LockIcon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                clipRule="evenodd"
              />
            </svg>
          </LockIcon>
          AI Productivity Report
        </PageTitle>
        <PageSubtitle>
          {isViewMode
            ? "View team productivity reports"
            : "Report on tasks where AI improved your productivity"}
        </PageSubtitle>
      </HeaderBanner>
      <ContentContainer>
        {isViewMode ? (
          // Reports viewing mode
          <ReportViewer 
            reports={reports} 
            threadTitle={threadTitle} 
          />
        ) : (
          // Report submission form
          <>
            {!success && (
              <ReportForm
                teamName={teamName}
                teamMember={teamMember}
                teamMemberOptions={teamMemberOptions}
                setTeamMember={setTeamMember}
                setTeamMemberOptions={setTeamMemberOptions}
                teamRole={teamRole}
                setTeamRole={setTeamRole}
                rows={rows}
                setRows={setRows}
                expandedRows={expandedRows}
                setExpandedRows={setExpandedRows}
                onSubmit={handleSubmit}
                error={formError}
                success={success}
                isSubmitting={isSubmitting}
              />
            )}

            {success && (
              <div>
                <h3>Report Submitted Successfully!</h3>
                <p>
                  Your productivity report has been encrypted and saved to the
                  thread.
                </p>
                <p>
                  <Link href={`/view/${id}?view=true`} legacyBehavior={false}>
                    View All Reports
                  </Link>
                  {" or "}
                  <Link href={`/view/${id}`} legacyBehavior={false}>
                    Return to Thread
                  </Link>
                </p>
              </div>
            )}
          </>
        )}
      </ContentContainer>
    </Container>
  );
};

export default ReportPage;