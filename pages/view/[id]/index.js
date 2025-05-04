import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DecryptionContainer from '../../../components/containers/DecryptionContainer';
import Head from 'next/head';
import styled from 'styled-components';
import { saveThreadToHistory } from '../../../lib/inboxUtils';

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

const KeyInputForm = styled.form`
  margin: 2rem auto;
  max-width: 600px;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const KeyInputTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
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

const ViewPage = ({ pageProps }) => {
  const router = useRouter();
  const { id } = router.query;
  const [key, setKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsKeyInput, setNeedsKeyInput] = useState(false);
  const [manualKey, setManualKey] = useState('');

  useEffect(() => {
    if (!router.isReady) return;

    try {
      // Extract key from URL fragment (#)
      const fragment = window.location.hash.slice(1);
      
      // Handle the case where no key is provided in the URL
      if (!fragment) {
        setNeedsKeyInput(true);
        setIsLoading(false);
        return;
      }
      
      setKey(fragment);
      
      // Save this thread to history for the inbox
      const currentUrl = window.location.href;
      saveThreadToHistory(id, id, currentUrl);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error parsing key from URL:', err);
      setError('Could not retrieve encryption key from URL. Make sure you have the complete link.');
      setIsLoading(false);
    }
  }, [router.isReady]);

  const handleKeySubmit = (e) => {
    e.preventDefault();
    
    if (!manualKey.trim()) {
      setError('Please enter a valid encryption key');
      return;
    }
    
    setKey(manualKey.trim());
    setNeedsKeyInput(false);
    
    // Update the URL with the hash to make it shareable
    window.location.hash = manualKey.trim();
  };

  if (isLoading) {
    return <LoadingMessage>Loading encrypted content...</LoadingMessage>;
  }

  if (needsKeyInput) {
    return (
      <Container>
        <KeyInputForm onSubmit={handleKeySubmit}>
          <KeyInputTitle>Enter Encryption Key</KeyInputTitle>
          <p>This encrypted thread requires a key for decryption. Please enter the encryption key:</p>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <KeyInput
            type="text"
            value={manualKey}
            onChange={(e) => setManualKey(e.target.value)}
            placeholder="Paste the encryption key here"
            required
          />
          
          <SubmitButton type="submit">Decrypt Thread</SubmitButton>
        </KeyInputForm>
      </Container>
    );
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

// These get called at build time
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps() {
  return {
    props: {
      pageProps: {}
    },
  };
}

export default ViewPage;