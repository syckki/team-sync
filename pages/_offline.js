import React from 'react';
import styled from 'styled-components';
import Layout from '../components/presentational/Layout';

const OfflineContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

const OfflineIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #777;
`;

const OfflineTitle = styled.h1`
  margin-bottom: 1rem;
`;

const OfflineMessage = styled.p`
  margin-bottom: 2rem;
  max-width: 600px;
`;

export default function Offline() {
  return (
    <Layout title="Offline - Secure Messenger">
      <OfflineContainer>
        <OfflineIcon>📶</OfflineIcon>
        <OfflineTitle>You're offline</OfflineTitle>
        <OfflineMessage>
          It looks like you've lost your internet connection. Don't worry - any encrypted messages you create or edit will be saved locally and synchronized when you're back online.
        </OfflineMessage>
      </OfflineContainer>
    </Layout>
  );
}