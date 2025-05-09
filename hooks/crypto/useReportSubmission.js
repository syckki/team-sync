import { useState } from "react";
import { importKeyFromBase64, encryptData } from "../../lib/cryptoUtils";

/**
 * Custom hook for handling report submission
 * Manages encryption and API interaction for submitting reports
 */
const useReportSubmission = (threadId, keyFragment, messageIndex = null) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  /**
   * Encrypt and submit report data
   * @param {Object} reportData - The report data to encrypt and submit
   * @param {string} status - The status of the report ("draft" or "submitted")
   * @param {string} teamName - The team name associated with the report
   * @returns {Promise<boolean>} - Success indicator
   */
  const submitReport = async (reportData, status, teamName) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Add author ID if available (for multi-user identification)
      const authorId = localStorage.getItem("encrypted-app-author-id");
      
      // Add fields to report data
      const completeReportData = {
        ...reportData,
        timestamp: new Date().toISOString(),
        status, // 'draft' or 'submitted' 
        authorId
      };

      // Import the key to use for encryption
      const cryptoKey = await importKeyFromBase64(keyFragment);

      // Encrypt the report data
      const jsonData = JSON.stringify(completeReportData);
      const { ciphertext, iv } = await encryptData(jsonData, cryptoKey);

      // Convert the combined ciphertext and IV to ArrayBuffer for upload
      const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
      combinedData.set(iv, 0);
      combinedData.set(new Uint8Array(ciphertext), iv.length);

      // Prepare the report submission
      const submitData = {
        threadId,
        threadTitle: teamName,
        data: Array.from(combinedData), // Convert the ArrayBuffer to array of bytes
        metadata: {
          authorId,
          isReport: true,
          timestamp: new Date().toISOString(),
          status, // Add status to metadata
        },
      };

      // If we're editing an existing message, include the messageIndex
      if (messageIndex !== null) {
        submitData.messageIndex = messageIndex;
      }

      // Send to the server
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(status === "draft" 
          ? "Error saving draft. Please try again." 
          : "Error submitting report. Please try again.");
      }

      setSuccess(true);
      setSuccessMessage(
        status === "draft"
          ? "Your AI productivity report has been saved as a draft!"
          : "Your AI productivity report has been submitted successfully!"
      );
      
      return true;
    } catch (err) {
      console.error("Error submitting report:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetStatus = () => {
    setSuccess(false);
    setError(null);
    setSuccessMessage("");
  };

  return {
    submitReport,
    isSubmitting,
    error,
    success,
    successMessage,
    resetStatus
  };
};

export default useReportSubmission;