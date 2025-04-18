import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Link from 'next/link';

const OfflineContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const OfflineTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const OfflineMessage = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 600px;
`;

const OfflineIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.secondary};
`;

const RetryButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 1rem;
  margin-top: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 0 0.5rem;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const OfflinePage = () => {
  return (
    <>
      <Head>
        <title>You're Offline | Secure Message App</title>
        <meta name="description" content="You are currently offline. Please check your internet connection." />
      </Head>
      <OfflineContainer>
        <OfflineIcon aria-hidden="true">📶</OfflineIcon>
        <OfflineTitle>You're Offline</OfflineTitle>
        <OfflineMessage>
          It looks like you've lost your internet connection. Don't worry, any messages you create while offline will be saved and sent automatically when you're back online.
        </OfflineMessage>
        <ButtonContainer>
          <Link href="/" passHref legacyBehavior>
            <RetryButton as="a">Go to Home</RetryButton>
          </Link>
          <RetryButton onClick={() => window.location.reload()}>
            Try Again
          </RetryButton>
        </ButtonContainer>
      </OfflineContainer>
    </>
  );
};

export default OfflinePage;