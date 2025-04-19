import Head from 'next/head';
import ProductivityReportContainer from '../components/containers/ProductivityReportContainer';
import styled from 'styled-components';

const Hero = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
  max-width: 800px;
  margin: 0 auto;
`;

const ProductivityReportPage = ({ staticProps }) => {
  return (
    <>
      <Head>
        <title>AI Productivity Report | Secure E2E Encryption</title>
        <meta name="description" content="Submit encrypted AI productivity reports securely" />
      </Head>
      <Hero>
        <Title>AI Productivity Report Submission</Title>
        <Subtitle>
          Submit your AI productivity data securely with end-to-end encryption.
          All information is encrypted in your browser and can only be accessed by authorized parties with the decryption key.
        </Subtitle>
      </Hero>
      <ProductivityReportContainer />
    </>
  );
};

// This gets called at build time
export async function getStaticProps() {
  return {
    props: {
      staticProps: {}
    }
  };
}

export default ProductivityReportPage;