import { useState, useEffect } from 'react';
import { importKeyFromBase64, decryptData, encryptData } from '../../lib/cryptoUtils';
import DecryptDisplay from '../presentational/DecryptDisplay';
import styled from 'styled-components';
import EncryptForm from '../presentational/EncryptForm';

const ErrorContainer = styled.div`
  padding: 1rem;
  margin: 1rem 0;
  background-color: ${({ theme }) => theme.colors.errorBg};
  color: ${({ theme }) => theme.colors.error};
  border-radius: 4px;
  border-left: 4px solid ${({ theme }) => theme.colors.error};
`;

const LoadingContainer = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

const RelatedMessagesContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 8px;
`;

const RelatedMessageTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const MessageCard = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 4px;
  border-left: 3px solid ${({ theme }) => theme.colors.secondary};
`;

const MessageLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MessageTime = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: 0.5rem;
`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const AddMessageForm = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ThreadTitle = styled.h3`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const MessagesContainer = styled.div`
  margin-top: 2rem;
`;

const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageItem = styled.div`
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const MessageTitle = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
`;

const MessageDate = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const MessageContent = styled.div`
  margin-top: 0.5rem;
  white-space: pre-wrap;
`;

const ToggleButton = styled.button`
  padding: 0.6rem 1.2rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondaryDark};
  }
`;

const ViewControls = styled.div`
  display: flex;
  margin-bottom: 1rem;
  gap: 0.5rem;
`;

const ViewButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.$active ? '#3498db' : '#e0e0e0'};
  color: ${props => props.$active ? '#fff' : '#333'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$active ? '#2980b9' : '#d0d0d0'};
  }
`;

const MessageBadge = styled.span`
  background-color: ${props => props.$isCreator ? '#e74c3c' : props.$isCurrentUser ? '#3498db' : '#7f8c8d'};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 1rem;
  font-weight: bold;
`;

const DecryptionContainer = ({ id, key64 }) => {
  const [threadMessages, setThreadMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAddingMessage, setIsAddingMessage] = useState(false);
  const [addMessageError, setAddMessageError] = useState(null);
  const [authorId, setAuthorId] = useState(null);
  const [isThreadCreator, setIsThreadCreator] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'mine', or 'creator'

  // Fetch all messages from the thread
  useEffect(() => {
    const fetchAndDecryptAll = async () => {
      if (!id || !key64) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get or create user's authorId from localStorage
        const userAuthorId = localStorage.getItem('encrypted-app-author-id') || 
          `author-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
        
        // Set or update the author ID in localStorage
        localStorage.setItem('encrypted-app-author-id', userAuthorId);
        setAuthorId(userAuthorId);
        
        // Import the key from the URL fragment
        const key = await importKeyFromBase64(key64);
        
        // Fetch all encrypted messages from the thread
        const response = await fetch(`/api/download?threadId=${id}&getAll=true`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch thread messages');
        }
        
        const threadData = await response.json();
        const decryptedMessages = [];
        let threadCreatorId = null;
        
        // Determine if the first message has creator metadata
        if (threadData.messages.length > 0 && 
            threadData.messages[0].metadata && 
            threadData.messages[0].metadata.isThreadCreator) {
          threadCreatorId = threadData.messages[0].metadata.authorId;
        }
        
        // Set isThreadCreator flag
        setIsThreadCreator(userAuthorId === threadCreatorId);
        
        // Decrypt each message in the thread
        for (const message of threadData.messages) {
          try {
            // Convert base64 data back to ArrayBuffer
            const encryptedBytes = Uint8Array.from(atob(message.data), c => c.charCodeAt(0));
            
            // Extract IV and ciphertext
            const iv = encryptedBytes.slice(0, 12);
            const ciphertext = encryptedBytes.slice(12);
            
            // Decrypt the data
            const decrypted = await decryptData(ciphertext, key, iv);
            
            // Parse the decrypted JSON
            const content = JSON.parse(new TextDecoder().decode(decrypted));
            
            // Add this message's author
            const messageAuthorId = message.metadata?.authorId || content.authorId || null;
            
            decryptedMessages.push({
              index: message.index,
              authorId: messageAuthorId,
              isCreator: messageAuthorId === threadCreatorId,
              isCurrentUser: messageAuthorId === userAuthorId,
              ...content,
              timestamp: content.timestamp || message.metadata?.timestamp
            });
          } catch (decryptError) {
            console.error(`Error decrypting message ${message.index}:`, decryptError);
          }
        }
        
        // Sort messages by index (which corresponds to chronological order)
        decryptedMessages.sort((a, b) => a.index - b.index);
        setThreadMessages(decryptedMessages);
      } catch (err) {
        console.error('Thread loading error:', err);
        setError(`Failed to load thread: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndDecryptAll();
  }, [id, key64]);

  // Add a new message to the thread
  const handleAddMessage = async (formData) => {
    setIsAddingMessage(true);
    setAddMessageError(null);
    
    try {
      // Import the key from the URL fragment
      const key = await importKeyFromBase64(key64);
      
      // Prepare data object
      const dataToEncrypt = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        timestamp: new Date().toISOString(),
        authorId: authorId // Include the author ID in the encrypted content
      };
      
      // Convert to JSON
      const jsonData = JSON.stringify(dataToEncrypt);
      
      // Encrypt the data
      const { ciphertext, iv } = await encryptData(jsonData, key);
      
      // Combine IV and ciphertext
      const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
      combinedData.set(iv, 0);
      combinedData.set(new Uint8Array(ciphertext), iv.length);
      
      // Upload to the server with the thread ID and author ID in headers
      const response = await fetch(`/api/upload?threadId=${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Author-ID': authorId
        },
        body: combinedData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to add message to thread');
      }
      
      // Add the new message to the UI immediately
      setThreadMessages(prev => [...prev, {
        ...dataToEncrypt,
        index: prev.length
      }]);
      
      // Hide the form
      setShowAddForm(false);
      
      // Show success message and reload after a delay
      alert("Message added successfully! The page will refresh to show the updated thread.");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Error adding message:', err);
      setAddMessageError(`Failed to add message: ${err.message}`);
    } finally {
      setIsAddingMessage(false);
    }
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };
  
  // Filter messages based on view mode
  const getFilteredMessages = () => {
    if (!isThreadCreator && viewMode === 'all') {
      // Non-creators shouldn't have an "all" view - default to their messages
      return threadMessages.filter(message => message.isCurrentUser);
    }
    
    switch (viewMode) {
      case 'mine':
        return threadMessages.filter(message => message.isCurrentUser);
      case 'creator':
        return threadMessages.filter(message => message.isCreator);
      case 'all':
        return threadMessages;
      default:
        return threadMessages;
    }
  };

  if (isLoading) {
    return <LoadingContainer>Loading encrypted thread...</LoadingContainer>;
  }

  if (error) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }

  if (!threadMessages || threadMessages.length === 0) {
    return <ErrorContainer>No messages found in this thread.</ErrorContainer>;
  }

  // Get visible messages based on filters
  const filteredMessages = getFilteredMessages();
  const filteredCount = filteredMessages.length;
  const totalCount = threadMessages.length;

  return (
    <>
      <MessagesContainer>
        <ThreadTitle>
          Encrypted Thread 
          {filteredCount !== totalCount ? 
            ` (Showing ${filteredCount} of ${totalCount} messages)` : 
            ` (${totalCount} messages)`}
        </ThreadTitle>
        
        {/* View controls - only show to thread creator */}
        {isThreadCreator && (
          <ViewControls>
            <ViewButton 
              $active={viewMode === 'all'} 
              onClick={() => setViewMode('all')}
            >
              All Messages
            </ViewButton>
            <ViewButton 
              $active={viewMode === 'mine'} 
              onClick={() => setViewMode('mine')}
            >
              My Messages
            </ViewButton>
            <ViewButton 
              $active={viewMode === 'creator'} 
              onClick={() => setViewMode('creator')}
            >
              Creator Messages
            </ViewButton>
          </ViewControls>
        )}
        
        {/* If user is not the creator, show info message about visibility */}
        {!isThreadCreator && (
          <ErrorContainer style={{ backgroundColor: '#f8f9fa', color: '#495057', borderLeft: '4px solid #6c757d' }}>
            Note: You can only see messages you've created in this thread.
          </ErrorContainer>
        )}
        
        <MessagesList>
          {filteredMessages.map((message, index) => (
            <MessageItem key={index}>
              <MessageHeader>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <MessageTitle>{message.title}</MessageTitle>
                  {message.isCurrentUser && (
                    <MessageBadge $isCurrentUser={true}>You</MessageBadge>
                  )}
                  {message.isCreator && !message.isCurrentUser && (
                    <MessageBadge $isCreator={true}>Creator</MessageBadge>
                  )}
                  {!message.isCreator && !message.isCurrentUser && (
                    <MessageBadge>Other</MessageBadge>
                  )}
                </div>
                {message.timestamp && (
                  <MessageDate>{formatDate(message.timestamp)}</MessageDate>
                )}
              </MessageHeader>
              <MessageContent>{message.message}</MessageContent>
            </MessageItem>
          ))}
        </MessagesList>
      </MessagesContainer>
      
      <AddMessageForm>
        <ThreadTitle>Add to this conversation</ThreadTitle>
        
        <ToggleButton onClick={toggleAddForm}>
          {showAddForm ? 'Hide Form' : 'Add New Message'}
        </ToggleButton>
        
        {showAddForm && (
          <EncryptForm 
            onSubmit={handleAddMessage}
            isLoading={isAddingMessage}
            error={addMessageError}
            isReply={true}
          />
        )}
      </AddMessageForm>
    </>
  );
};

export default DecryptionContainer;
