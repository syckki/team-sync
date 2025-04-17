import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';

const OfflineContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  background-color: #f8f9fa;
`;

const OfflineCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const OfflineIcon = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const Message = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const OfflinePage = () => {
  const tryReconnect = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <>
      <Head>
        <title>You are offline | SecureShare</title>
        <meta name="description" content="You are currently offline" />
      </Head>
      <OfflineContainer>
        <OfflineCard>
          <OfflineIcon>
            <span role="img" aria-label="offline">🔌</span>
          </OfflineIcon>
          <Title>You are offline</Title>
          <Message>
            Don't worry! Any messages you send while offline will be queued 
            and sent automatically when your connection is restored.
          </Message>
          <Message>
            You can continue using previously loaded threads and create new
            encrypted content which will be synchronized later.
          </Message>
          <Button onClick={tryReconnect}>Try to reconnect</Button>
        </OfflineCard>
      </OfflineContainer>
    </>
  );
};

export default OfflinePage;
