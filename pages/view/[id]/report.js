import React from "react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import styled from "styled-components";
import Link from "next/link";
import ReportForm from "../../../components/presentational/ReportForm";
import ReportViewer from "../../../components/containers/ReportViewer";

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

const ErrorMessage = styled.div`
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

const ReportPage = () => {
  const router = useRouter();
  const { id, view } = router.query;
  const isViewMode = view === "true";

  const [key, setKey] = useState(null);
  const [threadTitle, setThreadTitle] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamMemberOptions, setTeamMemberOptions] = useState([]);
  const [error, setError] = useState(null);

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

  // Fetch thread title when key is available
  useEffect(() => {
    if (key && id) {
      const authorId = localStorage.getItem("encrypted-app-author-id");
      if (authorId) {
        fetch(`/api/download?threadId=${id}&authorId=${authorId}`)
          .then((response) => response.json())
          .then((data) => {
            setThreadTitle(data.threadTitle || id);
            setTeamName(data.threadTitle || id);
          })
          .catch((err) => {
            console.error("Error fetching thread data:", err);
          });
      }
    }
  }, [key, id]);

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

          {isViewMode && threadTitle ? (
            <ReportViewer keyFragment={key} threadTitle={threadTitle} />
          ) : (
            <ReportForm
              keyFragment={key}
              teamName={teamName}
              teamMemberOptions={teamMemberOptions}
            />
          )}
          <Link href={`/view/${id}`}>
            <BackLinkText>← Back to inbox</BackLinkText>
          </Link>
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
