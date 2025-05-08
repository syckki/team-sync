import { useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import { useRouter } from "next/router";
import {
  Card,
  Button,
  Input,
  ErrorMessage,
  ContentContainer,
  PageHeader,
} from "../../../ui";

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
        <PageHeader
          title="Join an Existing Channel"
          subtitle="Enter the shared access key to continue."
          showLock={true}
        />

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
