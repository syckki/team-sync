import { useState, useEffect } from "react";
import {
  generateKey,
  encryptData,
  exportKeyToBase64,
} from "../../lib/cryptoUtils";
import { queueMessage } from "../../lib/dbService";
import {
  initNetworkMonitoring,
  isOnline,
  onOnline,
  onOffline,
  syncQueuedMessages,
} from "../../lib/networkService";
import EncryptForm from "../presentational/EncryptForm";
import styled from "styled-components";
import { useRouter } from "next/router";

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

const ReplyBadge = styled.div`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
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

const EncryptionContainer = ({ isReply = false, replyToId = null }) => {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptedResult, setEncryptedResult] = useState(null);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(true); // Default to online
  const [isQueued, setIsQueued] = useState(false);

  // Use a longer delay for replies to ensure user sees the confirmation
  const redirectDelay = isReply ? 2500 : 1500;

  const router = useRouter();

  // Initialize network monitoring
  useEffect(() => {
    const online = initNetworkMonitoring();
    setNetworkStatus(online);

    // Register callbacks
    const handleOnline = () => {
      setNetworkStatus(true);

      // Give a small delay before syncing to allow for stable connection
      setTimeout(() => {
        syncQueuedMessages(); // Try to send any queued messages
      }, 1000);
    };

    const handleOffline = () => {
      setNetworkStatus(false);
    };

    // Register for sync events to react after messages are sent
    const handleMessagesSynced = (event) => {
      console.log("Messages synchronized", event.detail);

      // If we're on the initial encryption page, we might need to update UI
      if (isQueued && encryptedResult && encryptedResult.queued) {
        // The messages have been synced, update UI to reflect this
        setIsQueued(false);

        // If we're not on a thread reply page, this might be a good time to reload or redirect
        if (!isReply) {
          // Show a message that the sync was successful
          alert("Your queued message has been sent successfully.");
        }
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
  }, [isQueued, encryptedResult, isReply]);

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove non-word chars
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start
      .replace(/-+$/, ""); // Trim - from end
  };

  const handleEncrypt = async (content) => {
    setIsEncrypting(true);
    setError(null);
    setCopySuccess(false);
    setIsQueued(false);

    try {
      // Generate a new AES-GCM 128-bit key
      const key = await generateKey();

      // Create data object with reply information if needed
      const dataObj = {
        title: content.title,
        message: content.message,
        timestamp: new Date().toISOString(),
      };

      // Add reply metadata if this is a reply
      if (isReply && replyToId) {
        dataObj.isReply = true;
        dataObj.replyToId = replyToId;
      }

      // Generate or retrieve author ID from localStorage
      let authorId = localStorage.getItem("encrypted-app-author-id");
      if (!authorId) {
        authorId = `author-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem("encrypted-app-author-id", authorId);
      }

      // Add author ID to data object
      dataObj.authorId = authorId;

      // Convert to JSON string
      const jsonData = JSON.stringify(dataObj);

      // Encrypt the content
      const { ciphertext, iv } = await encryptData(jsonData, key);

      // Convert the combined ciphertext and IV to ArrayBuffer for upload
      const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
      combinedData.set(iv, 0);
      combinedData.set(new Uint8Array(ciphertext), iv.length);

      // Check if we're online before trying to send to the server
      if (isOnline()) {
        // Online - upload the encrypted data to the server
        // Include threadId in the query if available for reply scenarios
        // Add thread title to the URL if this is a new thread (not a reply)
        const threadInfo = replyToId ? { threadId: replyToId } : {};

        if (content.title) {
          threadInfo.threadTitle = content.title;
        }

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...threadInfo,
            data: Array.from(combinedData), // <-- Convert the ArrayBuffer to array of bytes
            metadata: {
              authorId,
              timestamp: new Date().toISOString(),
            },
          }),
        });

        let responseData;

        if (!response.ok) {
          // Try to get more detailed error message from response
          const errorData = await response.json();

          if (
            response.status === 409 &&
            errorData.code === "DUPLICATE_THREAD_TITLE"
          ) {
            // Specific error for duplicate thread title
            // throw new Error(errorData.error || 'A thread with this title already exists.');
            router.push(`/channel/${slugify(content.title)}/join`);
            return;
          } else {
            throw new Error(
              errorData.error || "Failed to upload encrypted data",
            );
          }
        } else {
          // Parse the response body as JSON
          responseData = await response.json();
        }

        const responseUrl = responseData.url;

        // Export the key to Base64 format (for URL fragment)
        const keyBase64 = await exportKeyToBase64(key);

        // Create a complete URL with the key as a fragment
        const secureUrl = `${responseUrl}#${keyBase64}`;

        setEncryptedResult({ url: `${window.location.origin}${secureUrl}` });

        router.push(secureUrl);
      } else {
        // Offline - queue the message for later sending
        console.log(
          "You are offline. Message will be queued for later upload.",
        );

        // Metadata for the queued message
        const metadata = {
          authorId,
          title: content.title,
          timestamp: new Date().toISOString(),
        };

        // Queue the message in IndexedDB
        await queueMessage(
          replyToId, // threadId (null for new threads)
          combinedData, // encrypted data
          metadata, // metadata about the message
        );

        // Let the user know the message was queued
        setIsQueued(true);

        // Store temporarily in localStorage for later retrieval when online
        // Save a reference to this message for showing to the user
        try {
          // Export the key for later use
          const keyBase64 = await exportKeyToBase64(key);

          // Create a pseudo "secure link" for when we're back online
          const tempLink = replyToId
            ? `/channel/${replyToId}#${keyBase64}`
            : `/channel/pending_${Date.now().toString(36)}#${keyBase64}`;

          // Set a result so the user can see something was encrypted
          setEncryptedResult({
            url: tempLink,
            queued: true,
            title: content.title,
            replyToId: replyToId,
          });
        } catch (storageErr) {
          console.error("Error storing temporary data:", storageErr);
        }
      }
    } catch (err) {
      console.error("Encryption error:", err);
      setError(`Encryption failed: ${err.message}`);
    } finally {
      setIsEncrypting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(encryptedResult.url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy to clipboard");
    }
  };

  return (
    <>
      {isReply && replyToId && (
        <ReplyBadge>Replying to thread: {replyToId}</ReplyBadge>
      )}

      {/* Network status indicator */}
      {!networkStatus && (
        <OfflineNotification>
          <div>
            <OfflineStatus>You are offline.</OfflineStatus> Messages will be
            queued and sent automatically when your connection is restored.
          </div>
        </OfflineNotification>
      )}

      <EncryptForm
        onSubmit={handleEncrypt}
        isLoading={isEncrypting}
        error={error}
        isReply={isReply}
      />

      {/* Show queued message notification */}
      {isQueued && (
        <QueuedMessage>
          Your message has been queued and will be sent automatically when your
          connection is restored.
        </QueuedMessage>
      )}

      {encryptedResult && (
        <ResultContainer>
          <SuccessMessage>
            {encryptedResult.queued
              ? "Content encrypted and queued for sending!"
              : "Content encrypted successfully!"}
          </SuccessMessage>

          {encryptedResult.queued ? (
            <>
              <p>Your message will be accessible once you're back online.</p>
              <p>
                The encryption key has been stored securely and will be used
                when your connection is restored.
              </p>
              {encryptedResult.replyToId && (
                <p>
                  Your message will be added to thread:{" "}
                  {encryptedResult.replyToId}
                </p>
              )}
            </>
          ) : (
            <>
              <p>
                Share this secure link (includes the encryption key after the #
                symbol):
              </p>
              <SecureLink
                href={encryptedResult.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {encryptedResult.url}
              </SecureLink>
              <CopyButton onClick={copyToClipboard}>
                {copySuccess ? "Copied!" : "Copy Secure Link"}
              </CopyButton>
              <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
                Note: The encryption key is only included in the URL fragment
                (after the #) and is never sent to the server.
              </p>
              {isReply && !encryptedResult.queued && (
                <p style={{ fontStyle: "italic", marginTop: "0.5rem" }}>
                  Redirecting to your secure message in a moment...
                </p>
              )}
            </>
          )}
        </ResultContainer>
      )}
    </>
  );
};

export default EncryptionContainer;
