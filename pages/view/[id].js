import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DecryptionContainer from '../../components/containers/DecryptionContainer';
import Head from 'next/head';
import styled from 'styled-components';

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.colors.errorBg};
  border-radius: 8px;
  margin-top: 2rem;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
`;

const ViewPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [key, setKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;

    try {
      // Extract key from URL fragment (#)
      const fragment = window.location.hash.slice(1);
      if (!fragment) {
        throw new Error('No encryption key found in URL');
      }
      
      setKey(fragment);
      setIsLoading(false);
    } catch (err) {
      console.error('Error parsing key from URL:', err);
      setError('Could not retrieve encryption key from URL. Make sure you have the complete link.');
      setIsLoading(false);
    }
  }, [router.isReady]);

  if (isLoading) {
    return <LoadingMessage>Loading encrypted content...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <>
      <Head>
        <title>Secure Encrypted Thread</title>
        <meta name="description" content="View an encrypted thread securely" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <Container>
        <DecryptionContainer id={id} key64={key} />
      </Container>
    </>
  );
};

export default ViewPage;

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps() {
  return {
    props: {},
  };
}
