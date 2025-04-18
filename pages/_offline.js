import styled from 'styled-components';
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
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const Message = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text};
  max-width: 600px;
`;

const OfflineIcon = styled.div`
  width: 120px;
  height: 120px;
  margin-bottom: 2rem;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 60px;
    height: 60px;
    fill: white;
  }
`;

export default function Offline() {
  return (
    <>
      <Head>
        <title>You're Offline | Secure E2E Encryption</title>
      </Head>
      <OfflineContainer>
        <OfflineIcon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12,4C7.59,4,4,7.59,4,12s3.59,8,8,8,8-3.59,8-8S16.41,4,12,4Zm0,14c-3.31,0-6-2.69-6-6s2.69-6,6-6,6,2.69,6,6-2.69,6-6,6Z" />
            <path d="M12,8c-2.21,0-4,1.79-4,4s1.79,4,4,4,4-1.79,4-4-1.79-4-4-4Zm0,6c-1.1,0-2-.9-2-2s.9-2,2-2,2,.9,2,2-.9,2-2,2Z" />
            <path d="M19.03,8.48l-2.5-2.5c-.39-.39-1.03-.39-1.42,0s-.39,1.03,0,1.42l2.5,2.5c.39,.39,1.03,.39,1.42,0s.39-1.03,0-1.42Z" />
            <path d="M7.52,16.03l-2.5-2.5c-.39-.39-1.03-.39-1.42,0s-.39,1.03,0,1.42l2.5,2.5c.39,.39,1.03,.39,1.42,0s.39-1.03,0-1.42Z" />
          </svg>
        </OfflineIcon>
        <Title>You're Offline</Title>
        <Message>
          It looks like you're currently offline. The encrypted messaging app requires an internet connection for some features, but you can still view cached messages and prepare new ones that will be sent when you're back online.
        </Message>
        <Message>
          Don't worry - all your drafted messages are safely stored locally and will be synchronized automatically when your connection is restored.
        </Message>
      </OfflineContainer>
    </>
  );
}