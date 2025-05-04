import { useState, useEffect } from "react";
import {
  importKeyFromBase64,
  decryptData,
  encryptData,
} from "../../lib/cryptoUtils";
import { queueMessage } from "../../lib/dbService";
import {
  initNetworkMonitoring,
  isOnline,
  onOnline,
  onOffline,
  syncQueuedMessages,
} from "../../lib/networkService";
import { saveThreadToHistory } from "../../lib/inboxUtils";
import styled from "styled-components";
import EncryptForm from "../presentational/EncryptForm";

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
  background-color: ${(props) => (props.$active ? "#3498db" : "#e0e0e0")};
  color: ${(props) => (props.$active ? "#fff" : "#333")};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: ${(props) => (props.$active ? "bold" : "normal")};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.$active ? "#2980b9" : "#d0d0d0")};
  }
`;

const MessageBadge = styled.span`
  background-color: ${(props) =>
    props.$isQueued
      ? "#f39c12"
      : props.$isCreator
        ? "#e74c3c"
        : props.$isCurrentUser
          ? "#3498db"
          : "#7f8c8d"};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 1rem;
  font-weight: bold;
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

const DecryptionContainer = ({ id, key64 }) => {
  const [threadMessages, setThreadMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAddingMessage, setIsAddingMessage] = useState(false);
  const [addMessageError, setAddMessageError] = useState(null);
  const [authorId, setAuthorId] = useState(null);
  const [isThreadCreator, setIsThreadCreator] = useState(false);
  const [viewMode, setViewMode] = useState("all"); // 'all' or 'mine'
  const [networkStatus, setNetworkStatus] = useState(true); // Default to online
  const [isMessageQueued, setIsMessageQueued] = useState(false);
  const [threadTitle, setThreadTitle] = useState("");

  // Initialize network monitoring
  useEffect(() => {
    const online = initNetworkMonitoring();
    setNetworkStatus(online);

    // Register callbacks
    const handleOnline = () => {
      setNetworkStatus(true);

      // Add a small delay to ensure the connection is stable
      setTimeout(() => {
        syncQueuedMessages(); // Try to send any queued messages
      }, 1000);
    };

    const handleOffline = () => {
      setNetworkStatus(false);
    };

    // Register for sync events to react after messages are sent
    const handleMessagesSynced = (event) => {
      console.log("Messages synchronized in thread view", event.detail);

      // If we're in a thread and messages were synced, reload the page to show the new messages
      if (isMessageQueued) {
        setIsMessageQueued(false);

        // Reload after a short delay to show all synced messages
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };

    onOnline(handleOnline);
    onOffline(handleOffline);

    // Add event listener for sync events
    if (typeof window !== "undefined") {
      window.addEventListener("messages-synced", handleMessagesSynced);
    }

    // Cleanup on unmount
    return () => {
      // Remove event listeners
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("messages-synced", handleMessagesSynced);
      }
    };
  }, [isMessageQueued]);

  // Fetch messages from the thread based on view mode
  useEffect(() => {
    const fetchAndDecryptMessages = async () => {
      if (!id || !key64) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Generate or retrieve author ID from localStorage
        let userAuthorId = localStorage.getItem("encrypted-app-author-id");
        if (!userAuthorId) {
          userAuthorId = `author-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
          localStorage.setItem("encrypted-app-author-id", userAuthorId);
        }

        setAuthorId(userAuthorId);

        // Import the key from the URL fragment
        const key = await importKeyFromBase64(key64);

        // Determine if we should fetch all messages or just the user's
        const all = viewMode === "all" ? "" : "&all=false";

        // Fetch messages from the thread based on authorId and all parameter
        const response = await fetch(
          `/api/download?threadId=${id}&authorId=${userAuthorId}${all}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch thread messages");
        }

        const threadData = await response.json();
        const decryptedMessages = [];

        // Set thread metadata from the API response
        setIsThreadCreator(threadData.isCreator);
        const title = threadData.threadTitle || id;
        setThreadTitle(title);

        // Update document title in the browser if available
        if (typeof document !== "undefined") {
          document.title = `${title} - Secure Encrypted Thread`;
          
          // Save thread to history with proper title
          const currentUrl = window.location.href;
          saveThreadToHistory(id, title, currentUrl);
        }

        // Decrypt each message in the thread
        for (const message of threadData.messages) {
          try {
            // Convert base64 data back to ArrayBuffer
            const encryptedBytes = Uint8Array.from(atob(message.data), (c) =>
              c.charCodeAt(0),
            );

            // Extract IV and ciphertext
            const iv = encryptedBytes.slice(0, 12);
            const ciphertext = encryptedBytes.slice(12);

            // Decrypt the data
            const decrypted = await decryptData(ciphertext, key, iv);

            // Parse the decrypted JSON
            const content = JSON.parse(new TextDecoder().decode(decrypted));

            // Add this message's author
            const messageAuthorId =
              message.metadata?.authorId || content.authorId || null;

            // Check if this is a productivity report
            const isReport =
              message.metadata?.isReport ||
              content.type === "aiProductivityReport";

            // Process productivity reports differently to display nicely in thread view
            if (isReport && content.type === "aiProductivityReport") {
              // Get the tool name from the first entry or use a default
              const firstTool =
                content.entries && content.entries.length > 0
                  ? content.entries[0].aiTool
                  : "AI Tool";

              decryptedMessages.push({
                index: message.index,
                authorId: messageAuthorId,
                isCreator: message.metadata?.isThreadCreator || false,
                isCurrentUser: messageAuthorId === userAuthorId,
                isReport: true,
                title: `Report from ${content.teamMember} (${content.teamRole})`,
                message: firstTool, // Show the AI tool used
                timestamp: content.timestamp || message.metadata?.timestamp,
              });
            } else {
              // Regular message processing
              decryptedMessages.push({
                index: message.index,
                authorId: messageAuthorId,
                isCreator: message.metadata?.isThreadCreator || false,
                isCurrentUser: messageAuthorId === userAuthorId,
                ...content,
                timestamp: content.timestamp || message.metadata?.timestamp,
              });
            }
          } catch (decryptError) {
            console.error(
              `Error decrypting message ${message.index}:`,
              decryptError,
            );
          }
        }

        // Sort messages by index (which corresponds to chronological order)
        decryptedMessages.sort((a, b) => a.index - b.index);
        setThreadMessages(decryptedMessages);
      } catch (err) {
        console.error("Thread loading error:", err);
        setError(`Failed to load thread: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndDecryptMessages();
  }, [id, key64, viewMode]); // Added viewMode as dependency so it refetches when view changes

  // Add a new message to the thread
  const handleAddMessage = async (formData) => {
    setIsAddingMessage(true);
    setAddMessageError(null);
    setIsMessageQueued(false);

    try {
      // Import the key from the URL fragment
      const key = await importKeyFromBase64(key64);

      // Prepare data object
      const dataToEncrypt = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        timestamp: new Date().toISOString(),
        authorId: authorId, // Include the author ID in the encrypted content
      };

      // Convert to JSON
      const jsonData = JSON.stringify(dataToEncrypt);

      // Encrypt the data
      const { ciphertext, iv } = await encryptData(jsonData, key);

      // Combine IV and ciphertext
      const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
      combinedData.set(iv, 0);
      combinedData.set(new Uint8Array(ciphertext), iv.length);

      // Check if we're online before trying to send to the server
      if (isOnline()) {
        // Online - upload the encrypted data to the server
        const response = await fetch(`/api/upload?threadId=${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "X-Author-ID": authorId,
          },
          body: combinedData,
        });

        if (!response.ok) {
          throw new Error("Failed to add message to thread");
        }

        // Add the new message to the UI immediately
        setThreadMessages((prev) => [
          ...prev,
          {
            ...dataToEncrypt,
            index: prev.length,
            isCurrentUser: true,
          },
        ]);

        // Hide the form
        setShowAddForm(false);

        // Show success message and reload after a delay
        alert(
          "Message added successfully! The page will refresh to show the updated thread.",
        );
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Offline - queue the message for later sending
        console.log(
          "You are offline. Message will be queued for later upload.",
        );

        // Metadata for the queued message
        const metadata = {
          authorId,
          title: formData.title,
          timestamp: new Date().toISOString(),
        };

        // Queue the message in IndexedDB
        await queueMessage(
          id, // threadId
          combinedData, // encrypted data
          metadata, // metadata about the message
        );

        // Let the user know the message was queued
        setIsMessageQueued(true);

        // Add the new message to the UI immediately with a "queued" flag
        setThreadMessages((prev) => [
          ...prev,
          {
            ...dataToEncrypt,
            index: prev.length,
            isCurrentUser: true,
            isQueued: true,
          },
        ]);

        // Hide the form
        setShowAddForm(false);

        // No reload - queued messages will be sent when back online
        alert(
          "You are currently offline. Your message has been saved and will be sent when you're back online.",
        );
      }
    } catch (err) {
      console.error("Error adding message:", err);
      setAddMessageError(`Failed to add message: ${err.message}`);
    } finally {
      setIsAddingMessage(false);
    }
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  if (isLoading) {
    return <LoadingContainer>Loading encrypted thread...</LoadingContainer>;
  }

  if (error) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }
  /*
  if (!threadMessages || threadMessages.length === 0) {
    return <ErrorContainer>No messages found in this thread.</ErrorContainer>;
  }
*/
  // Since filtering is now done on the backend, we can just use the messages directly
  const filteredMessages = threadMessages;
  const filteredCount = threadMessages.length;
  const totalCount = threadMessages.length; // May need to update if we store total count from API

  return (
    <>
      {/* Show offline notification when needed */}
      {!networkStatus && (
        <OfflineNotification>
          <div>
            <OfflineStatus>You are offline.</OfflineStatus> Messages will be
            queued and sent automatically when your connection is restored.
          </div>
        </OfflineNotification>
      )}

      {/* Show queued message notification */}
      {isMessageQueued && (
        <QueuedMessage>
          Your message has been queued and will be sent automatically when your
          connection is restored.
        </QueuedMessage>
      )}

      <MessagesContainer>
        <ThreadTitle>
          {threadTitle}
          {filteredCount !== totalCount
            ? ` (Showing ${filteredCount} of ${totalCount} messages)`
            : ` (${totalCount} messages)`}
        </ThreadTitle>

        {/* View controls - only show to thread creator */}
        {isThreadCreator && (
          <ViewControls>
            <ViewButton
              $active={viewMode === "all"}
              onClick={() => setViewMode("all")}
            >
              All Messages
            </ViewButton>
            <ViewButton
              $active={viewMode === "mine"}
              onClick={() => setViewMode("mine")}
            >
              My Messages
            </ViewButton>
            <ViewButton
              onClick={() =>
                (window.location.href = `/view/${id}/report?view=true#${key64}`)
              }
              style={{ backgroundColor: "#4caf50", color: "white" }}
            >
              View Reports
            </ViewButton>
          </ViewControls>
        )}

        {/* If user is not the creator, show info message about visibility */}
        {!isThreadCreator && (
          <ErrorContainer
            style={{
              backgroundColor: "#f8f9fa",
              color: "#495057",
              borderLeft: "4px solid #6c757d",
            }}
          >
            Note: You can only see messages you've created in this thread.
          </ErrorContainer>
        )}

        <MessagesList>
          {filteredMessages.map((message, index) => (
            <MessageItem key={index}>
              <MessageHeader>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <MessageTitle>{message.title}</MessageTitle>
                  {message.isQueued && (
                    <MessageBadge $isQueued={true}>Queued</MessageBadge>
                  )}
                  {!message.isQueued && message.isCurrentUser && (
                    <MessageBadge $isCurrentUser={true}>You</MessageBadge>
                  )}
                  {!message.isQueued &&
                    message.isCreator &&
                    !message.isCurrentUser && (
                      <MessageBadge $isCreator={true}>Creator</MessageBadge>
                    )}
                  {!message.isQueued &&
                    !message.isCreator &&
                    !message.isCurrentUser && (
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

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <ToggleButton onClick={toggleAddForm}>
            {showAddForm ? "Hide Form" : "Add New Message"}
          </ToggleButton>

          <ToggleButton
            onClick={() =>
              (window.location.href = `/view/${id}/report#${key64}`)
            }
            style={{ backgroundColor: "#4caf50" }}
          >
            Submit AI Productivity Report
          </ToggleButton>
        </div>

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
