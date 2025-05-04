import Head from 'next/head';
import EncryptionContainer from '../components/containers/EncryptionContainer';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const HeaderBanner = styled.div`
  background-color: #3b82f6;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 0.5rem;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  
  @media (max-width: 576px) {
    font-size: 1rem;
  }
`;

const LockIcon = styled.span`
  display: inline-flex;
  margin-right: 0.5rem;
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
    
    @media (max-width: 576px) {
      margin-right: 0.15rem;
    }
  }
`;

const PageSubtitle = styled.p`
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
  
  @media (max-width: 576px) {
    font-size: 0.875rem;
  }
`;

const ContentContainer = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const HomePage = ({ staticProps }) => {
  return (
    <>
      <Head>
        <title>Secure Communications Hub</title>
        <meta name="description" content="End-to-End Encrypted Communication Platform" />
      </Head>
      <Container>
        <HeaderBanner>
          <PageTitle>
            <LockIcon>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </LockIcon>
            Secure End-to-End Encryption
          </PageTitle>
          <PageSubtitle>
            Share sensitive information securely using client-side encryption
          </PageSubtitle>
        </HeaderBanner>
        <ContentContainer>
          <EncryptionContainer />
        </ContentContainer>
      </Container>
    </>
  );
};

// This gets called at build time
export async function getStaticProps() {
  return {
    props: {
      staticProps: {}
    },
  };
}

export default HomePage;
