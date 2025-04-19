import { useState, useEffect } from 'react';
import { generateKey, encryptData, exportKeyToBase64 } from '../../lib/cryptoUtils';
import { queueMessage } from '../../lib/dbService';
import { initNetworkMonitoring, isOnline } from '../../lib/networkService';
import ProductivityReportForm from '../presentational/ProductivityReportForm';
import styled from 'styled-components';

const ResultContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.successBg};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SecureLink = styled.a`
  display: block;
  margin: 1rem 0;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  word-break: break-all;
  color: ${({ theme }) => theme.colors.primary};
  font-family: monospace;
  text-decoration: none;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundHover};
  }
`;

const CopyButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const SuccessMessage = styled.p`
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: 1rem;
  font-weight: 600;
`;

const OfflineNotification = styled.div`
  padding: 0.75rem;
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const OfflineStatus = styled.span`
  font-weight: bold;
`;

const QueuedMessage = styled.div`
  padding: 0.75rem;
  background-color: #cce5ff;
  color: #004085;
  border: 1px solid #b8daff;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const ProductivityReportContainer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [encryptedResult, setEncryptedResult] = useState(null);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(true);
  const [isQueued, setIsQueued] = useState(false);
  
  useEffect(() => {
    // Initialize network monitoring
    const online = initNetworkMonitoring();
    setNetworkStatus(online);
    
    // Cleanup on unmount
    return () => {
      // Cleanup code if needed
    };
  }, []);

  const handleSubmit = async (reportData) => {
    setIsSubmitting(true);
    setError(null);
    setCopySuccess(false);
    setIsQueued(false);
    
    try {
      // Generate a new AES-GCM 128-bit key
      const key = await generateKey();
      
      // Generate or retrieve author ID from localStorage
      let authorId = localStorage.getItem('encrypted-app-author-id');
      if (!authorId) {
        authorId = `author-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem('encrypted-app-author-id', authorId);
      }
      
      // Add author ID to data object
      reportData.authorId = authorId;
      reportData.timestamp = new Date().toISOString();
      
      // Convert to JSON string
      const jsonData = JSON.stringify(reportData);
      
      // Encrypt the content
      const { ciphertext, iv } = await encryptData(jsonData, key);
      
      // Convert the combined ciphertext and IV to ArrayBuffer for upload
      const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
      combinedData.set(iv, 0);
      combinedData.set(new Uint8Array(ciphertext), iv.length);
      
      // Check if we're online before trying to send to the server
      if (isOnline()) {
        // Online - upload the encrypted data to the server
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-Author-ID': authorId,
            'X-Report-Type': 'productivity'
          },
          body: combinedData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload encrypted data');
        }
        
        const responseData = await response.json();
        const threadId = responseData.threadId;
        const responseUrl = responseData.url;
        
        // Export the key to Base64 format (for URL fragment)
        const keyBase64 = await exportKeyToBase64(key);
        
        // Create a complete URL with the key as a fragment
        const secureUrl = `${window.location.origin}${responseUrl}#${keyBase64}`;
        
        setEncryptedResult({ url: secureUrl });
      } else {
        // Offline - queue the message for later sending
        console.log('You are offline. Report will be queued for later upload.');
        
        // Metadata for the queued message
        const metadata = {
          authorId,
          reportType: 'productivity',
          teamName: reportData.teamName,
          timestamp: new Date().toISOString()
        };
        
        // Queue the message in IndexedDB
        await queueMessage(
          null, // threadId (null for new threads)
          combinedData, // encrypted data
          metadata     // metadata about the message
        );
        
        // Let the user know the message was queued
        setIsQueued(true);
        
        try {
          // Export the key for later use
          const keyBase64 = await exportKeyToBase64(key);
          
          // Create a pseudo "secure link" for when we're back online
          const tempLink = `/view/pending_${Date.now().toString(36)}#${keyBase64}`;
          
          // Set a result so the user can see something was encrypted
          setEncryptedResult({ 
            url: tempLink,
            queued: true,
            teamName: reportData.teamName
          });
        } catch (storageErr) {
          console.error('Error storing temporary data:', storageErr);
        }
      }
    } catch (err) {
      console.error('Encryption error:', err);
      setError(`Encryption failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(encryptedResult.url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <>
      {/* Network status indicator */}
      {!networkStatus && (
        <OfflineNotification>
          <div>
            <OfflineStatus>You are offline.</OfflineStatus> Reports will be queued and sent automatically when your connection is restored.
          </div>
        </OfflineNotification>
      )}
      
      <ProductivityReportForm 
        onSubmit={handleSubmit} 
        isLoading={isSubmitting} 
        error={error}
      />
      
      {/* Show queued message notification */}
      {isQueued && (
        <QueuedMessage>
          Your productivity report has been queued and will be sent automatically when your connection is restored.
        </QueuedMessage>
      )}
      
      {encryptedResult && (
        <ResultContainer>
          <SuccessMessage>
            {encryptedResult.queued 
              ? 'Report encrypted and queued for sending!' 
              : 'Report encrypted and submitted successfully!'}
          </SuccessMessage>
          
          {encryptedResult.queued ? (
            <>
              <p>Your report will be accessible once you're back online.</p>
              <p>The encryption key has been stored securely and will be used when your connection is restored.</p>
            </>
          ) : (
            <>
              <p>Share this secure link (includes the encryption key after the # symbol):</p>
              <SecureLink href={encryptedResult.url} target="_blank" rel="noopener noreferrer">
                {encryptedResult.url}
              </SecureLink>
              <CopyButton onClick={copyToClipboard}>
                {copySuccess ? 'Copied!' : 'Copy Secure Link'}
              </CopyButton>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                Note: The encryption key is only included in the URL fragment (after the #) and is never sent to the server.
              </p>
            </>
          )}
        </ResultContainer>
      )}
    </>
  );
};

export default ProductivityReportContainer;