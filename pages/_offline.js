import styled from 'styled-components';
import Head from 'next/head';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 20px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
  max-width: 600px;
`;

const OfflineIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
`;

const Card = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  max-width: 600px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const List = styled.ul`
  text-align: left;
  margin: 1rem 0;
  padding-left: 1.5rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.5rem;
  color: #555;
`;

export default function Offline() {
  return (
    <Container>
      <Head>
        <title>You are offline - SecureShare</title>
      </Head>
      
      <OfflineIcon>📶</OfflineIcon>
      <Title>You are currently offline</Title>
      <Subtitle>
        Don't worry! SecureShare works offline and will automatically sync
        your messages when you're back online.
      </Subtitle>
      
      <Card>
        <CardTitle>While offline, you can still:</CardTitle>
        <List>
          <ListItem>View previously loaded encrypted messages</ListItem>
          <ListItem>Create new encrypted messages</ListItem>
          <ListItem>Queue messages to be sent when back online</ListItem>
          <ListItem>Access locally cached content</ListItem>
        </List>
      </Card>
      
      <Subtitle style={{ marginTop: '2rem' }}>
        Try refreshing the page once you're back online.
      </Subtitle>
    </Container>
  );
}
