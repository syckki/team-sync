import styled from 'styled-components';
import Head from 'next/head';
import Layout from '../components/presentational/Layout';

const AboutContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  margin: 2rem 0 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const Paragraph = styled.p`
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const FeatureList = styled.ul`
  margin: 1rem 0 1.5rem;
  padding-left: 1.5rem;
  
  li {
    margin-bottom: 0.75rem;
    line-height: 1.6;
  }
`;

const SecurityBadge = styled.div`
  background-color: ${({ theme }) => theme.colors.card};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: 4px;
`;

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About - SecureShare</title>
        <meta name="description" content="Learn about SecureShare's end-to-end encryption and privacy features" />
      </Head>
      
      <AboutContainer>
        <Title>About SecureShare</Title>
        
        <Paragraph>
          SecureShare is a secure messaging platform that puts your privacy first. 
          Our application uses advanced end-to-end encryption technology to ensure that 
          only you and your intended recipients can read your messages.
        </Paragraph>
        
        <SecurityBadge>
          <strong>Security Note:</strong> All encryption and decryption happens directly in your browser. 
          Your encryption keys and unencrypted messages never leave your device. Our servers only store 
          encrypted data and cannot access your original messages.
        </SecurityBadge>
        
        <Subtitle>Key Features</Subtitle>
        <FeatureList>
          <li><strong>End-to-End Encryption:</strong> Using the Web Crypto API with AES-GCM 128-bit encryption.</li>
          <li><strong>Secure Thread System:</strong> Create encrypted conversation threads where multiple participants can exchange messages.</li>
          <li><strong>Message Filtering:</strong> Thread creators can view all messages or filter to see only their own messages.</li>
          <li><strong>Offline Support:</strong> Progressive Web App (PWA) capabilities allow you to compose messages even when offline.</li>
          <li><strong>Network Resilience:</strong> Messages composed while offline are automatically queued and sent when your connection is restored.</li>
          <li><strong>No Account Required:</strong> Use SecureShare without creating an account or providing personal information.</li>
        </FeatureList>
        
        <Subtitle>How It Works</Subtitle>
        <Paragraph>
          When you create a new encrypted message, SecureShare generates a unique encryption key in your browser. 
          This key is used to encrypt your message before it's sent to our servers. The key is included in the 
          shareable link but is never sent to our servers.
        </Paragraph>
        
        <Paragraph>
          When someone accesses your shared link, the encryption key in the URL fragment (the part after the #) 
          is used to decrypt the message directly in their browser. This ensures that the encryption key is never 
          transmitted over the network or stored on our servers.
        </Paragraph>
        
        <Subtitle>Privacy Commitment</Subtitle>
        <Paragraph>
          At SecureShare, we believe in privacy by design. Our entire system is built around the principle that 
          your data belongs to you. We cannot read your messages, even if compelled to do so, because we simply 
          never have access to your encryption keys or unencrypted content.
        </Paragraph>
      </AboutContainer>
    </Layout>
  );
}