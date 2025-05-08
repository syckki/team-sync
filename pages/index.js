import Head from "next/head";
import ChannelFormViewModel from "../viewModels/ChannelFormViewModel";
import { Card, ContentContainer, PageHeader } from "../ui";

const HomePage = () => {
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
          <ChannelFormViewModel />
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
