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

const RelatedMessagesContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
`;

const RelatedMessageTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const MessageCard = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 4px;
  border-left: 3px solid ${({ theme }) => theme.colors.secondary};
`;

const MessageLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MessageTime = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: 0.5rem;
`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const DecryptionContainer = ({ id, key64 }) => {
  const [decryptedContent, setDecryptedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedMessages, setRelatedMessages] = useState([]);

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
        
        // Log for debugging
        console.log('Received encrypted data size:', encryptedData.byteLength);
        
        // Extract the IV (first 12 bytes) and ciphertext (rest)
        const iv = new Uint8Array(encryptedData.slice(0, 12));
        const ciphertext = encryptedData.slice(12);
        
        // Decrypt the data
        const decrypted = await decryptData(ciphertext, key, iv);
        
        // Parse the decrypted JSON
        const content = JSON.parse(new TextDecoder().decode(decrypted));
        
        setDecryptedContent(content);
        
        // Check if this is a reply to another message or has replies
        if (content.replyToId) {
          // Store the parent message ID
          const parentMessageId = content.replyToId;
          setRelatedMessages(prev => [...prev, {
            id: parentMessageId,
            type: 'parent',
            title: 'Original Message'
          }]);
        }
        
        // In a real app, we would fetch related replies here
        // For this demo, we'll just show a placeholder if this is a reply
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

  return (
    <>
      <DecryptDisplay content={decryptedContent} />
      
      {relatedMessages.length > 0 && (
        <RelatedMessagesContainer>
          <RelatedMessageTitle>Related Messages</RelatedMessageTitle>
          
          {relatedMessages.map(message => (
            <MessageCard key={message.id}>
              <MessageLink 
                href={`/view/${message.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {message.title || 'View related message'}
              </MessageLink>
              <p>
                {message.type === 'parent' 
                  ? 'This is the original message that was replied to.' 
                  : 'This is a reply to this message.'}
              </p>
              <MessageTime>
                {message.timestamp ? formatDate(message.timestamp) : 'Timestamp unavailable'}
              </MessageTime>
            </MessageCard>
          ))}
        </RelatedMessagesContainer>
      )}
    </>
  );
};

export default DecryptionContainer;
