import { useState, useEffect } from 'react';
import { importKeyFromBase64, decryptData } from '../../lib/cryptoUtils';
import DecryptDisplay from '../presentational/DecryptDisplay';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  padding: 1rem;
  margin: 1rem 0;
  background-color: ${({ theme }) => theme.colors.errorBg};
  color: ${({ theme }) => theme.colors.error};
  border-radius: 4px;
  border-left: 4px solid ${({ theme }) => theme.colors.error};
`;

const LoadingContainer = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

const DecryptionContainer = ({ id, key64 }) => {
  const [decryptedContent, setDecryptedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndDecrypt = async () => {
      if (!id || !key64) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Import the key from the URL fragment
        const key = await importKeyFromBase64(key64);
        
        // Fetch the encrypted data
        const response = await fetch(`/api/download?id=${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch encrypted data');
        }
        
        // Get the encrypted data as ArrayBuffer
        const encryptedData = await response.arrayBuffer();
        
        // Extract the IV (first 12 bytes) and ciphertext (rest)
        const iv = encryptedData.slice(0, 12);
        const ciphertext = encryptedData.slice(12);
        
        // Decrypt the data
        const decrypted = await decryptData(ciphertext, key, iv);
        
        // Parse the decrypted JSON
        const content = JSON.parse(new TextDecoder().decode(decrypted));
        
        setDecryptedContent(content);
      } catch (err) {
        console.error('Decryption error:', err);
        setError(`Failed to decrypt: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndDecrypt();
  }, [id, key64]);

  if (isLoading) {
    return <LoadingContainer>Decrypting content...</LoadingContainer>;
  }

  if (error) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }

  if (!decryptedContent) {
    return <ErrorContainer>No content could be decrypted.</ErrorContainer>;
  }

  return <DecryptDisplay content={decryptedContent} />;
};

export default DecryptionContainer;
