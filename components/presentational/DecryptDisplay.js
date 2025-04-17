import { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
  word-break: break-word;
`;

const Timestamp = styled.div`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
`;

const MessageContent = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 1.5rem;
  word-break: break-word;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const InfoBox = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.infoLight};
  border-left: 4px solid ${({ theme }) => theme.colors.info};
  border-radius: 4px;
  font-size: 0.9rem;
`;

const formatDate = (isoString) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleString();
  } catch (e) {
    return 'Unknown date';
  }
};

const DecryptDisplay = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Container>
      <Title>{content.title}</Title>
      
      {content.timestamp && (
        <Timestamp>
          Created on: {formatDate(content.timestamp)}
        </Timestamp>
      )}
      
      <MessageContent>
        {content.message}
      </MessageContent>
      
      <Button onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy Message'}
      </Button>
      
      <InfoBox>
        <p>This message was decrypted in your browser using end-to-end encryption.</p>
        <p>The encryption key was never sent to the server and was only accessible through the URL fragment (after the # symbol).</p>
      </InfoBox>
    </Container>
  );
};

export default DecryptDisplay;
