import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import styled from "styled-components";
import { getVisitedThreads, getRecentlySharedThread, clearRecentlySharedThread } from "../lib/inboxUtils";
import { Breakpoint } from "../lib/styles";

// Styled components using the same styling as the Create New Thread page
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
  max-width: 600px;
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
  @media (max-width: ${Breakpoint.MOBILE_LANDSCAPE}px) {
    font-size: 1rem;
    line-height: 1.3rem;
  }
`;

const InboxIcon = styled.div`
  width: 1.25rem;
  height: auto;
  margin-right: 0.5rem;
  display: inline-flex;

  /* Reduce size on mobile devices */
  @media (max-width: ${Breakpoint.MOBILE_LANDSCAPE}px) {
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
  @media (max-width: ${Breakpoint.MOBILE_LANDSCAPE}px) {
    font-size: 0.8rem;
    line-height: 1.1rem;
    margin-top: 0.25rem;
  }
`;

const ContentContainer = styled.div`
  padding: 0 2rem 2rem;

  @media (max-width: ${Breakpoint.TABLET_PORTRAIT}px) {
    padding: 0 1rem 1.5rem;
  }
`;

const ThreadCard = styled.div`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ThreadTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
`;

const ThreadDate = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 0.75rem;
`;

const ThreadLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ActionLink = styled(Link)`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const RecentThreadBanner = styled.div`
  background-color: ${({ theme }) => theme.colors.successBg};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const RecentThreadTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.success};
  font-size: 1rem;
  font-weight: 600;
`;

const SecureLink = styled.a`
  display: block;
  margin: 1rem 0;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  word-break: break-all;
  color: ${({ theme }) => theme.colors.primary};
  font-family: monospace;
  font-size: 0.9rem;
  text-decoration: none;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundHover};
  }
`;

const CopyButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const DismissButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-left: 0.5rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundHover};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const InboxPage = () => {
  const [threads, setThreads] = useState([]);
  const [recentThread, setRecentThread] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  useEffect(() => {
    // Load thread history from localStorage
    const threadHistory = getVisitedThreads();
    setThreads(threadHistory);
    
    // Check if we have a recently shared thread
    const recent = getRecentlySharedThread();
    if (recent) {
      setRecentThread(recent);
    }
  }, []);
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  // Copy secure link to clipboard
  const copyToClipboard = () => {
    if (recentThread && navigator.clipboard) {
      navigator.clipboard.writeText(recentThread)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };
  
  // Dismiss the recent thread notification
  const dismissRecentThread = () => {
    clearRecentlySharedThread();
    setRecentThread(null);
  };

  return (
    <>
      <Head>
        <title>Inbox | AI Productivity Tracker</title>
        <meta
          name="description"
          content="View and manage your secure encrypted threads"
        />
      </Head>
      <Container>
        <HeaderBanner>
          <PageTitle>
            <InboxIcon>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 12h-6l-2 3h-4l-2-3H2"></path>
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
              </svg>
            </InboxIcon>
            Inbox
          </PageTitle>
          <PageSubtitle>
            Access all your secure conversations and shared threads
          </PageSubtitle>
        </HeaderBanner>
        <ContentContainer>
          {/* Display recently shared thread if available */}
          {recentThread && (
            <RecentThreadBanner>
              <RecentThreadTitle>Recently Shared Thread</RecentThreadTitle>
              <p>Share this secure link (includes the encryption key after the # symbol):</p>
              <SecureLink href={recentThread} target="_blank" rel="noopener noreferrer">
                {recentThread}
              </SecureLink>
              <ButtonContainer>
                <CopyButton onClick={copyToClipboard}>
                  {copySuccess ? 'Copied!' : 'Copy Secure Link'}
                </CopyButton>
                <DismissButton onClick={dismissRecentThread}>
                  Dismiss
                </DismissButton>
              </ButtonContainer>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                Note: The encryption key is only included in the URL fragment (after the #) and is never sent to the server.
              </p>
            </RecentThreadBanner>
          )}
          
          {/* List of threads */}
          {threads.length > 0 ? (
            threads.map((thread) => (
              <ThreadCard key={thread.id}>
                <ThreadLink href={thread.url}>
                  <ThreadTitle>{thread.title}</ThreadTitle>
                  <ThreadDate>Last visited: {formatDate(thread.lastVisited)}</ThreadDate>
                </ThreadLink>
              </ThreadCard>
            ))
          ) : (
            <EmptyState>
              <p>You haven't visited any threads yet.</p>
              <ActionLink href="/">Create New Thread</ActionLink>
            </EmptyState>
          )}
        </ContentContainer>
      </Container>
    </>
  );
};

export default InboxPage;