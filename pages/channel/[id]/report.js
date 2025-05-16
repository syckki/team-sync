import { useRouter } from "next/router";
import { useMachine } from "@xstate/react";
import Head from "next/head";
import styled from "styled-components";
import Link from "next/link";
import ReportPageViewModel from "../../../machines/ReportPageViewModel";
import { Card, ErrorMessage, ContentContainer, PageHeader } from "../../../ui";
import { getEncryptedAuthorId } from "../../../lib/cryptoUtils";
import ReportFormView from "../../../views/ReportFormView";
import ReportViewerView from "../../../views/ReportViewerView";
import { inspector } from "../../../ui/XStateInspectorButton";

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

const ReportPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const url = new URL(router.asPath, "https://example.com");
  const { view, index } = Object.fromEntries(url.searchParams.entries());
  const key = url.hash.slice(1);
  const messageIndex = index ? parseInt(index, 10) : null;

  const [state] = useMachine(ReportPageViewModel, {
    inspect: inspector.inspect,
    input: {
      key,
      threadId: id,
      authorId: getEncryptedAuthorId(),
      messageIndex,
      mode: view === "true" ? "viewer" : "form",
    },
  });

  return (
    <>
      <Head>
        <title>
          {state.context.mode === "viewer"
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
          {state.context.error && (
            <ErrorMessage type="error">{state.context.error}</ErrorMessage>
          )}

          {state.matches("loading") ? (
            <LoadingMessage>Loading...</LoadingMessage>
          ) : (
            <>
              {state.matches("viewer") && (
                <ReportViewerView actor={state.children.reportViewer} />
              )}
              {state.matches("form") && (
                <ReportFormView actor={state.children.reportForm} />
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
