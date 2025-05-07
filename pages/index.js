import Head from "next/head";
import EncryptionViewModel from "../viewModels/EncryptionViewModel";
import { Card, ContentContainer, PageHeader } from "../components/ui";

// Using ContentContainer from UI components

const HomePage = ({ staticProps }) => {
  return (
    <>
      <Head>
        <title>Create New Channel</title>
        <meta
          name="description"
          content="Start a secure channel for team collaboration."
        />
      </Head>
      <Card
        noPadding
        noPaddingHeader
        className="home-container"
        style={{ maxWidth: "600px", margin: "0 auto 2rem auto" }}
      >
        <PageHeader 
          title="Create New Channel"
          subtitle="Start a secure channel for team collaboration."
          showLock={true}
        />
        <ContentContainer>
          <EncryptionViewModel />
        </ContentContainer>
      </Card>
    </>
  );
};

// This gets called at build time
export async function getStaticProps() {
  return {
    props: {
      staticProps: {},
    },
  };
}

export default HomePage;
