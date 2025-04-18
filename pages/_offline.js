import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';

const OfflineContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f9fafb;
`;

const OfflineCard = styled.div`
  max-width: 500px;
  width: 100%;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: #111827;
  margin-bottom: 1rem;
  text-align: center;
`;

const Message = styled.p`
  color: #4b5563;
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.6;
`;

const Button = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2563eb;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  }
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const CachedDataSection = styled.div`
  margin-top: 2rem;
`;

const List = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
`;

const ListItem = styled.li`
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  background-color: #f3f4f6;
  border-radius: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export default function Offline() {
  const [cachedThreads, setCachedThreads] = React.useState([]);
  const [loadingCachedData, setLoadingCachedData] = React.useState(true);

  React.useEffect(() => {
    // Check for cached threads in IndexedDB when component mounts
    const loadCachedThreads = async () => {
      try {
        setLoadingCachedData(true);
        
        // Check if IndexedDB is supported
        if (!('indexedDB' in window)) {
          console.error('IndexedDB not supported');
          setLoadingCachedData(false);
          return;
        }
        
        // Open our cache database
        const dbPromise = indexedDB.open('secure-share-cache', 1);
        
        dbPromise.onerror = (event) => {
          console.error('Error opening database:', event.target.error);
          setLoadingCachedData(false);
        };
        
        dbPromise.onupgradeneeded = (event) => {
          const db = event.target.result;
          // Create object store for threads if it doesn't exist
          if (!db.objectStoreNames.contains('threads')) {
            db.createObjectStore('threads', { keyPath: 'threadId' });
          }
        };
        
        dbPromise.onsuccess = (event) => {
          const db = event.target.result;
          try {
            const transaction = db.transaction(['threads'], 'readonly');
            const store = transaction.objectStore('threads');
            const threads = [];
            
            const cursorRequest = store.openCursor();
            
            cursorRequest.onsuccess = (event) => {
              const cursor = event.target.result;
              if (cursor) {
                threads.push(cursor.value);
                cursor.continue();
              } else {
                // All entries gathered
                setCachedThreads(threads);
                setLoadingCachedData(false);
              }
            };
            
            cursorRequest.onerror = (event) => {
              console.error('Error reading cached threads:', event.target.error);
              setLoadingCachedData(false);
            };
            
          } catch (error) {
            console.error('Error accessing thread store:', error);
            setLoadingCachedData(false);
          }
        };
      } catch (error) {
        console.error('Error loading cached threads:', error);
        setLoadingCachedData(false);
      }
    };
    
    loadCachedThreads();
  }, []);
  
  return (
    <OfflineContainer>
      <Head>
        <title>Offline - SecureShare</title>
      </Head>
      
      <OfflineCard>
        <IconContainer>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
        </IconContainer>
        
        <Title>You are offline</Title>
        <Message>
          You're currently offline, but don't worry! Your encrypted data is securely stored in your browser.
          You can still access previously opened threads and any messages you send will be queued for delivery when 
          you're back online.
        </Message>
        
        <Button onClick={() => window.location.href = '/'}>
          Go to Homepage
        </Button>
      </OfflineCard>
      
      {cachedThreads.length > 0 && (
        <OfflineCard>
          <Title>Available Offline</Title>
          <Message>
            The following threads are available for viewing offline:
          </Message>
          
          <List>
            {cachedThreads.map((thread) => (
              <ListItem key={thread.threadId}>
                <a href={`/view/${thread.threadId}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                  Thread #{thread.threadId.substring(thread.threadId.length - 8)}
                </a>
              </ListItem>
            ))}
          </List>
        </OfflineCard>
      )}
      
      {loadingCachedData && (
        <OfflineCard>
          <Message>Loading available offline content...</Message>
        </OfflineCard>
      )}
      
      {!loadingCachedData && cachedThreads.length === 0 && (
        <OfflineCard>
          <Message>
            No previously viewed threads found. Once you're back online, 
            visit thread pages to make them available offline.
          </Message>
        </OfflineCard>
      )}
    </OfflineContainer>
  );
}
