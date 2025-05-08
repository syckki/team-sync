import { useState } from "react";
import { encryptData, importKeyFromBase64 } from "../../lib/cryptoUtils";

/**
 * Custom hook for handling report submission
 * Manages submission state, encryption, and API calls
 * 
 * @param {string} threadId - ID of the thread to submit to
 * @param {string} keyFragment - Base64 encryption key
 * @param {string} teamName - Name of the team (used for thread title)
 * @param {number|null} messageIndex - Optional message index for updating existing reports
 * @returns {Object} Submission state and functions
 */
const useReportSubmission = (threadId, keyFragment, teamName, messageIndex = null) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  /**
   * Encrypt and submit the report data with draft status
   * @param {Object} formData - Form data to encrypt and submit
   * @returns {Promise<Object|null>} Result of submission
   */
  const saveAsDraft = async (formData) => {
    return submitReport(formData, "draft");
  };

  /**
   * Encrypt and submit the report data with final status
   * @param {Object} formData - Form data to encrypt and submit
   * @param {Function} callback - Optional callback function on success
   * @returns {Promise<Object|null>} Result of submission
   */
  const submitFinalReport = async (formData, callback = null) => {
    return submitReport(formData, "submitted", callback);
  };

  /**
   * Generic function to submit report with either draft or final status
   * @param {Object} formData - Form data to encrypt and submit
   * @param {string} status - Status to set ('draft' or 'submitted')
   * @param {Function} callback - Optional callback function on success
   * @returns {Promise<Object|null>} Result of submission
   */
  const submitReport = async (formData, status = "draft", callback = null) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      // Add status to the form data
      const reportData = {
        ...formData,
        status,
      };

      // Generate or retrieve author ID from localStorage
      let authorId = localStorage.getItem("encrypted-app-author-id");
      if (!authorId) {
        authorId = `author-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem("encrypted-app-author-id", authorId);
      }

      // Import the key from base64
      const cryptoKey = await importKeyFromBase64(keyFragment);

      // Convert report data to JSON and encrypt
      const jsonData = JSON.stringify(reportData);
      const encrypted = await encryptData(jsonData, cryptoKey);

      // Convert encrypted data to Base64 for transmission
      const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

      // Prepare metadata for the message
      const messageMetadata = {
        isReport: true,
        author: authorId,
        timestamp: new Date().toISOString(),
        status,
      };

      // Make API request to add message to thread
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId: threadId || null, // If threadId is null, a new thread will be created
          threadTitle: teamName || "AI Productivity Report",
          encryptedData: encryptedBase64,
          metadata: messageMetadata,
          specificMessageIndex: messageIndex,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Set success message based on status
      const action = status === "draft" ? "saved as draft" : "submitted";
      setSuccessMessage(`Report successfully ${action}!`);

      // Add team member to localStorage for future use if it's not already there
      if (formData.teamMember) {
        try {
          const existingMembers = JSON.parse(localStorage.getItem("teamMemberOptions") || "[]");
          if (!existingMembers.includes(formData.teamMember)) {
            existingMembers.push(formData.teamMember);
            localStorage.setItem("teamMemberOptions", JSON.stringify(existingMembers));
          }
        } catch (err) {
          console.error("Error updating team member options:", err);
        }
      }

      // Call the callback function if provided
      if (callback && typeof callback === "function") {
        callback(result);
      }

      return result;
    } catch (err) {
      console.error("Error submitting report:", err);
      setError(`Error submitting report: ${err.message}`);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    successMessage,
    saveAsDraft,
    submitFinalReport,
    setError,
    setSuccessMessage,
  };
};

export default useReportSubmission;