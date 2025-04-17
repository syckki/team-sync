import { useState } from 'react';
import { generateKey, encryptData, exportKeyToBase64 } from '../../lib/cryptoUtils';
import EncryptForm from '../presentational/EncryptForm';
import styled from 'styled-components';

const ResultContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.successBg};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SecureLink = styled.a`
  display: block;
  margin: 1rem 0;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  word-break: break-all;
  color: ${({ theme }) => theme.colors.primary};
  font-family: monospace;
  text-decoration: none;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundHover};
  }
`;

const CopyButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const SuccessMessage = styled.p`
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: 1rem;
  font-weight: 600;
`;

const ReplyBadge = styled.div`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const EncryptionContainer = ({ isReply = false, replyToId = null }) => {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptedResult, setEncryptedResult] = useState(null);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Use a longer delay for replies to ensure user sees the confirmation
  const redirectDelay = isReply ? 2500 : 1500;

  const handleEncrypt = async (content) => {
    setIsEncrypting(true);
    setError(null);
    setCopySuccess(false);
    
    try {
      // Generate a new AES-GCM 128-bit key
      const key = await generateKey();
      
      // Create data object with reply information if needed
      const dataObj = {
        title: content.title,
        message: content.message,
        timestamp: new Date().toISOString()
      };
      
      // Add reply metadata if this is a reply
      if (isReply && replyToId) {
        dataObj.isReply = true;
        dataObj.replyToId = replyToId;
      }
      
      // Convert to JSON string
      const jsonData = JSON.stringify(dataObj);
      
      // Encrypt the content
      const { ciphertext, iv } = await encryptData(jsonData, key);
      
      // Convert the combined ciphertext and IV to ArrayBuffer for upload
      const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
      combinedData.set(iv, 0);
      combinedData.set(new Uint8Array(ciphertext), iv.length);
      
      // Upload the encrypted data to the server
      // Include threadId in the query if available for reply scenarios
      const uploadEndpoint = replyToId ? `/api/upload?threadId=${replyToId}` : '/api/upload';
      
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: combinedData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload encrypted data');
      }
      
      const responseData = await response.json();
      const threadId = responseData.threadId;
      const responseUrl = responseData.url;
      
      // Export the key to Base64 format (for URL fragment)
      const keyBase64 = await exportKeyToBase64(key);
      
      // Create a complete URL with the key as a fragment
      const secureUrl = `${window.location.origin}${responseUrl}#${keyBase64}`;
      
      setEncryptedResult({ url: secureUrl });
      
      // Automatically redirect to the secure URL after a delay
      setTimeout(() => {
        window.location.href = secureUrl;
      }, redirectDelay);
    } catch (err) {
      console.error('Encryption error:', err);
      setError(`Encryption failed: ${err.message}`);
    } finally {
      setIsEncrypting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(encryptedResult.url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <>
      {isReply && replyToId && (
        <ReplyBadge>Replying to thread: {replyToId}</ReplyBadge>
      )}
      
      <EncryptForm 
        onSubmit={handleEncrypt} 
        isLoading={isEncrypting} 
        error={error}
        isReply={isReply}
      />
      
      {encryptedResult && (
        <ResultContainer>
          <SuccessMessage>Content encrypted successfully!</SuccessMessage>
          <p>Share this secure link (includes the encryption key after the # symbol):</p>
          <SecureLink href={encryptedResult.url} target="_blank" rel="noopener noreferrer">
            {encryptedResult.url}
          </SecureLink>
          <CopyButton onClick={copyToClipboard}>
            {copySuccess ? 'Copied!' : 'Copy Secure Link'}
          </CopyButton>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            Note: The encryption key is only included in the URL fragment (after the #) and is never sent to the server.
          </p>
          {isReply && (
            <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>
              Redirecting to your secure message in a moment...
            </p>
          )}
        </ResultContainer>
      )}
    </>
  );
};

export default EncryptionContainer;