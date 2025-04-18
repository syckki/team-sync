import styled from 'styled-components';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { isOnline } from '../lib/networkService';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 1rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
`;

const Message = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 600px;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const StatusDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.online ? '#4caf50' : '#f44336'};
  margin-right: 0.5rem;
`;

const StatusText = styled.span`
  font-size: 0.9rem;
  color: ${props => props.online ? '#4caf50' : '#f44336'};
`;

const QueueIndicator = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background-color: ${props => props.theme.colors.lightBackground};
  max-width: 400px;
  margin-bottom: 2rem;
`;

export default function Offline() {
  const [online, setOnline] = useState(false);
  const [queuedMessages, setQueuedMessages] = useState(0);

  useEffect(() => {
    // Check network status
    const checkStatus = () => {
      setOnline(isOnline());
    };

    // Check for queued messages
    const checkQueue = async () => {
      try {
        const { default: dbService } = await import('../lib/dbService');
        const messages = await dbService.getQueuedMessages();
        setQueuedMessages(messages.length);
      } catch (error) {
        console.error('Error checking queued messages:', error);
      }
    };

    // Initial check
    checkStatus();
    checkQueue();

    // Set up listeners for online/offline events
    window.addEventListener('online', () => {
      checkStatus();
      checkQueue();
    });
    
    window.addEventListener('offline', () => {
      checkStatus();
      checkQueue();
    });

    // Periodic check
    const interval = setInterval(() => {
      checkStatus();
      checkQueue();
    }, 10000);

    return () => {
      window.removeEventListener('online', checkStatus);
      window.removeEventListener('offline', checkStatus);
      clearInterval(interval);
    };
  }, []);

  return (
    <Container>
      <Head>
        <title>Offline Mode | SecureShare</title>
      </Head>
      <Title>You're currently offline</Title>
      
      <StatusIndicator>
        <StatusDot online={online} />
        <StatusText online={online}>{online ? 'Online' : 'Offline'}</StatusText>
      </StatusIndicator>
      
      <Message>
        Don't worry! SecureShare works offline. Any messages you compose will be
        securely stored on your device and sent when you're back online.
      </Message>
      
      {queuedMessages > 0 && (
        <QueueIndicator>
          You have {queuedMessages} message{queuedMessages > 1 ? 's' : ''} queued for delivery
          when your connection is restored.
        </QueueIndicator>
      )}
      
      <Message>
        <strong>Tip:</strong> You can continue composing and encrypting messages.
        They'll be securely stored locally and synchronized automatically when your 
        connection is restored.
      </Message>
    </Container>
  );
}
