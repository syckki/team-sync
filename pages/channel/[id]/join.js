import { useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import { useRouter } from "next/router";
import { Card, Button, Input, ErrorMessage, ContentContainer } from "../../../components/ui";

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

// Using ContentContainer from UI components

const KeyInputForm = styled.form`
  margin: 2rem auto;
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

      <Card
        noPadding
        noPaddingHeader
        className="join-container"
        style={{ maxWidth: "600px", margin: "0 auto 2rem auto" }}
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
            {error && <ErrorMessage type="error">{error}</ErrorMessage>}

            <Input
              type="text"
              value={manualKey}
              onChange={(e) => setManualKey(e.target.value)}
              placeholder="Paste the access key shared with you"
              required
              style={{ fontFamily: "monospace" }}
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              style={{ marginTop: "1rem" }}
            >
              Join Channel
            </Button>
          </KeyInputForm>
        </ContentContainer>
      </Card>
    </>
  );
};

export default JoinToThreadPage;
