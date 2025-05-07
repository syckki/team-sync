import { useState, useEffect } from "react";
import {
  importKeyFromBase64,
  decryptData,
  encryptData,
} from "../lib/cryptoUtils";
import { queueMessage } from "../lib/dbService";
import {
  initNetworkMonitoring,
  isOnline,
  onOnline,
  onOffline,
  syncQueuedMessages,
} from "../lib/networkService";
import styled from "styled-components";
import EncryptForm from "../components/presentational/EncryptForm";
import { Button, ErrorMessage, WarningMessage, InfoMessage, Card } from "../components/ui";

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

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  gap: 0.75rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
  }
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

const MessageDate = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const MessageContent = styled.div`
  margin-top: 0.5rem;
  white-space: pre-wrap;
`;

const ViewControls = styled.div`
  display: flex;
  margin-bottom: 1rem;
  gap: 0.5rem;
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

const DecryptionViewModel = ({ id, key64 }) => {
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
  const [secureShareLink, setSecureShareLink] = useState("");

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

        // Generate the secure sharing link with the current key
        if (threadData.isCreator && key64) {
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          const secureUrl = `${origin}/channel/${id}#${key64}`;
          setSecureShareLink(secureUrl);
        }

        // Update document title in the browser if available
        if (typeof document !== "undefined") {
          document.title = `${title} - Secure Encrypted Thread`;
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
            const isReport = message.metadata?.isReport;

            // Process productivity reports differently to display nicely in thread view
            if (isReport) {
              // Get the tool name from the first entry or use a default
              const firstTool =
                content.entries && content.entries.length > 0
                  ? content.entries[0].aiTool
                  : "AI Tool";

              // Get report status (default to "submitted" for backward compatibility)
              const reportStatus = content.status || "submitted";

              decryptedMessages.push({
                index: message.index,
                authorId: messageAuthorId,
                isCreator: message.metadata?.isThreadCreator || false,
                isCurrentUser: messageAuthorId === userAuthorId,
                isReport: true,
                reportStatus: reportStatus, // Add status to allow edit of drafts
                title: `Report from ${content.teamMember} (${content.teamRole})`,
                message: firstTool, // Show the AI tool used
                timestamp: content.timestamp || message.metadata?.timestamp,
                reportData: content, // Store full report data for editing
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
  }, [viewMode]); // Added viewMode as dependency so it refetches when view changes

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

  // Handle click on a report message - navigate to appropriate route
  const handleReportClick = (message) => {
    // Use the standard view=false parameter for all reports
    // The messageIndex is used to identify the specific message
    if (message.isReport) {
      window.location.href = `/channel/${id}/report?view=false&index=${message.index}#${key64}`;
    }
  };

  if (isLoading) {
    return <LoadingContainer>Loading encrypted thread...</LoadingContainer>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }
  /*
  if (!threadMessages || threadMessages.length === 0) {
    return <InfoMessage>No messages found in this thread.</InfoMessage>;
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
        <WarningMessage title="You are offline">
          Messages will be queued and sent automatically when your connection is
          restored.
        </WarningMessage>
      )}

      {/* Show queued message notification */}
      {isMessageQueued && (
        <InfoMessage title="Message Queued">
          Your message has been queued and will be sent automatically when your
          connection is restored.
        </InfoMessage>
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
            <Button
              variant={viewMode === "all" ? "primary" : "secondary"}
              size="small"
              onClick={() => setViewMode("all")}
            >
              All Messages
            </Button>
            <Button
              variant={viewMode === "mine" ? "primary" : "secondary"}
              size="small"
              onClick={() => setViewMode("mine")}
            >
              My Messages
            </Button>
            <Button
              variant="success"
              size="small"
              onClick={() =>
                (window.location.href = `/channel/${id}/report?view=true#${key64}`)
              }
            >
              View Reports
            </Button>
          </ViewControls>
        )}

        {/* If user is not the creator, show info message about visibility */}
        {!isThreadCreator && (
          <InfoMessage>
            Note: You can only see messages you've created in this thread.
          </InfoMessage>
        )}

        {/* Show SecureLink for thread creator only */}
        {isThreadCreator && secureShareLink && (
          <InfoMessage title="Share this secure link with your team:">
            <div style={{ 
              padding: '0.75rem',
              marginTop: '0.5rem',
              background: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: '0.375rem', 
              wordBreak: 'break-all',
              fontSize: '0.875rem',
              fontFamily: 'monospace'
            }}>
              {secureShareLink}
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="primary"
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(secureShareLink);
                  alert('Secure Link copied to clipboard!');
                }}
              >
                Copy Secure Link
              </Button>
            </div>
          </InfoMessage>
        )}

        <MessagesList>
          {filteredMessages.map((message, index) => {
            // Determine if message should be clickable/editable (user's own draft reports)
            const isEditable = message.isCurrentUser && message.isReport;

            return (
              <Card
                key={index}
                clickable={isEditable}
                onClick={() =>
                  message.isReport ? handleReportClick(message) : null
                }
                headerRight={
                  message.timestamp && (
                    <MessageDate>{formatDate(message.timestamp)}</MessageDate>
                  )
                }
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {message.title}
                    {message.isQueued && (
                      <MessageBadge $isQueued={true}>Queued</MessageBadge>
                    )}
                    {message.isReport && message.reportStatus === "draft" && (
                      <MessageBadge style={{ backgroundColor: "#F59E0B" }}>
                        Draft
                      </MessageBadge>
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
                }
              >
                <MessageContent>
                  {message.message ||
                    (message.reportData && message.reportData.entries
                      ? [
                          ...new Set(
                            message.reportData.entries
                              .map((entry) => entry.aiToolsUsed)
                              .join(",")
                              .split(","),
                          ),
                        ]
                      : "")}
                  {isEditable && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.9rem",
                        color: "#4CAF50",
                      }}
                    >
                      Click to edit this draft report
                    </div>
                  )}
                </MessageContent>
              </Card>
            );
          })}
        </MessagesList>
      </MessagesContainer>

      <AddMessageForm>
        <ButtonRow>
          <Button onClick={toggleAddForm} variant="primary">
            {showAddForm ? "Hide Form" : "Add New Message"}
          </Button>

          <Button
            onClick={() =>
              (window.location.href = `/channel/${id}/report#${key64}`)
            }
            variant="success"
          >
            Submit AI Productivity Report
          </Button>
        </ButtonRow>

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

export default DecryptionViewModel;
