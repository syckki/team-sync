import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DecryptionContainer from '../../components/containers/DecryptionContainer';
import Head from 'next/head';
import styled from 'styled-components';
import EncryptionContainer from '../../components/containers/EncryptionContainer';

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

const ShareSection = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const ToggleButton = styled.button`
  padding: 0.6rem 1.2rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondaryDark};
  }
`;

const ViewPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [key, setKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);

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

  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };

  if (isLoading) {
    return <LoadingMessage>Loading encrypted content...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <>
      <Head>
        <title>Decrypt Secure Message</title>
        <meta name="description" content="View an encrypted message securely" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <Container>
        <DecryptionContainer id={id} key64={key} />
        
        <ShareSection>
          <SectionTitle>Send a Secure Reply</SectionTitle>
          <p>Create a new encrypted message and share it securely with others.</p>
          
          <ToggleButton onClick={toggleReplyForm}>
            {showReplyForm ? 'Hide Reply Form' : 'Show Reply Form'}
          </ToggleButton>
          
          {showReplyForm && (
            <EncryptionContainer isReply={true} replyToId={id} />
          )}
        </ShareSection>
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
