import { useState, useEffect } from "react";
import { importKeyFromBase64, decryptData } from "../lib/cryptoUtils";

/**
 * Custom hook for fetching, decrypting, and managing report data
 */
const useReportData = (threadId, key) => {
  const [reports, setReports] = useState([]);
  const [threadTitle, setThreadTitle] = useState("");
  const [teamName, setTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch thread title when key is available
  useEffect(() => {
    if (key && threadId) {
      const authorId = localStorage.getItem("encrypted-app-author-id");
      if (authorId) {
        fetch(`/api/download?threadId=${threadId}&authorId=${authorId}`)
          .then((response) => response.json())
          .then((data) => {
            setThreadTitle(data.threadTitle || threadId);
            setTeamName(data.threadTitle || threadId);
          })
          .catch((err) => {
            console.error("Error fetching thread data:", err);
          });
      }
    }
  }, [key, threadId]);

  // Fetch reports for view mode
  const fetchReports = async (keyValue) => {
    try {
      setIsLoading(true);

      // Get author ID from localStorage
      const authorId = localStorage.getItem("encrypted-app-author-id");
      if (!authorId) {
        throw new Error(
          "Author ID not found. Please go back to the thread view."
        );
      }

      // Fetch all messages from the thread
      const response = await fetch(
        `/api/download?threadId=${threadId}&authorId=${authorId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch thread data");
      }

      const threadData = await response.json();

      // Import the key from fragment
      const cryptoKey = await importKeyFromBase64(keyValue);

      // Filter and decrypt reports
      const decryptedReports = [];

      for (const message of threadData.messages) {
        // Check if this message is marked as a report in metadata
        if (message.metadata && message.metadata.isReport) {
          try {
            // Convert base64 data back to ArrayBuffer
            const encryptedBytes = Uint8Array.from(atob(message.data), (c) =>
              c.charCodeAt(0)
            );

            // Extract IV and ciphertext
            const iv = encryptedBytes.slice(0, 12);
            const ciphertext = encryptedBytes.slice(12);

            // Decrypt the data
            const decrypted = await decryptData(ciphertext, cryptoKey, iv);

            // Parse the decrypted JSON
            const content = JSON.parse(new TextDecoder().decode(decrypted));

            decryptedReports.push({
              id: message.index,
              timestamp: message.metadata.timestamp || new Date().toISOString(),
              authorId: message.metadata.authorId,
              isCurrentUser: message.metadata.authorId === authorId,
              ...content,
            });
          } catch (err) {
            console.error("Error decrypting report:", err);
          }
        }
      }

      // Sort reports by timestamp, newest first
      decryptedReports.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setReports(decryptedReports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(`Failed to load reports: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reports,
    threadTitle,
    teamName,
    setThreadTitle,
    setTeamName,
    isLoading,
    error,
    setError,
    fetchReports
  };
};

export default useReportData;