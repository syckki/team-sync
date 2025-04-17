import Head from 'next/head';
import EncryptionContainer from '../components/containers/EncryptionContainer';
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
  max-width: 600px;
  margin: 0 auto;
`;

const HomePage = () => {
  return (
    <>
      <Head>
        <title>Secure E2E Encryption</title>
        <meta name="description" content="End-to-End Encrypted File Sharing Application" />
      </Head>
      <Hero>
        <Title>Secure End-to-End Encryption</Title>
        <Subtitle>
          Share sensitive information securely using client-side encryption.
          The encryption key never leaves your browser.
        </Subtitle>
      </Hero>
      <EncryptionContainer />
    </>
  );
};

export default HomePage;

// This gets called at build time
export async function getStaticProps() {
  return {
    props: {}, // will be passed to the page component as props
  };
}
