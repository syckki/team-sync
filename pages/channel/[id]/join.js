import { useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import { useRouter } from "next/router";
import { Card, Button, Input, ErrorMessage } from "../../../components/ui";

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

// Renamed to avoid conflict with imported ErrorMessage component
const StyledErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.colors.errorBg};
  border-radius: 8px;
  margin-top: 2rem;
`;

const KeyInputForm = styled.form`
  margin: 2rem auto;
`;

const KeyInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin: 1rem 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-family: monospace;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const JoinToThreadPage = () => {
  const [error, setError] = useState(null);
  const [manualKey, setManualKey] = useState("");

  const router = useRouter();

  const handleKeySubmit = (e) => {
    e.preventDefault();

    if (!manualKey.trim()) {
      setError("Please enter a valid encryption key");
      return;
    }

    // Update the URL with the hash to make it shareable
    router.push(`/channel/${router.query.id}#${manualKey.trim()}`);
  };

  return (
    <>
      <Head>
        <title>Join an Existing Channel</title>
        <meta
          name="description"
          content="Enter the shared access key to continue."
        />
      </Head>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Card
          noPadding
          noPaddingHeader
        >
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
              Join an Existing Channel
            </PageTitle>
            <PageSubtitle>Enter the shared access key to continue.</PageSubtitle>
          </HeaderBanner>

          <ContentContainer>
            <KeyInputForm onSubmit={handleKeySubmit}>
              {error && <ErrorMessage>{error}</ErrorMessage>}

              <Input
                type="text"
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
                placeholder="Paste the access key shared with you"
                label="Access Key"
                required
              />

              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <Button type="submit" variant="primary">Join Channel</Button>
              </div>
            </KeyInputForm>
          </ContentContainer>
        </Card>
      </div>
    </>
  );
};

export default JoinToThreadPage;
