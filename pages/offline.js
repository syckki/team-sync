import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Head from 'next/head';

const OfflineContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Title = styled.h1`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2rem;
`;

const Message = styled.p`
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text};
  max-width: 500px;
`;

const Icon = styled.div`
  margin-bottom: 2rem;
  font-size: 5rem;
  color: ${({ theme }) => theme.colors.secondary};
`;

const HomeLink = styled.a`
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const InfoText = styled.p`
  margin-top: 2rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const OfflinePage = () => {
  return (
    <>
      <Head>
        <title>Offline | Secure Encrypted Messaging</title>
      </Head>
      <OfflineContainer>
        <Icon>📶</Icon>
        <Title>You're currently offline</Title>
        <Message>
          You can still create and view encrypted messages that have been previously loaded.
          New messages will be queued and sent automatically when your connection is restored.
        </Message>
        <Link href="/" passHref legacyBehavior>
          <HomeLink>Go to Home Page</HomeLink>
        </Link>
        <InfoText>
          This app works offline thanks to Progressive Web App technology.
          Your data is always encrypted and secure, even when offline.
        </InfoText>
      </OfflineContainer>
    </>
  );
};

export default OfflinePage;