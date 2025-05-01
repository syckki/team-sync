import { useState } from "react";
import { encryptData, importKeyFromBase64 } from "../lib/cryptoUtils";

/**
 * Custom hook for managing report form state and submission
 */
const useReportForm = (threadId, key) => {
  const [teamMember, setTeamMember] = useState("");
  const [teamMemberOptions, setTeamMemberOptions] = useState([]);
  const [teamRole, setTeamRole] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [rows, setRows] = useState([
    {
      id: Date.now(),
      platform: "",
      projectInitiative: "",
      sdlcStep: "",
      sdlcTask: "",
      taskCategory: "",
      taskDetails: "",
      estimatedTimeWithoutAI: "",
      actualTimeWithAI: "",
      // timeSaved is calculated
      aiToolUsed: [],
      complexity: "",
      qualityImpact: "",
      notesHowAIHelped: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError(null);

      // Get author ID from localStorage
      const authorId = localStorage.getItem("encrypted-app-author-id");
      if (!authorId) {
        throw new Error(
          "Author ID not found. Please refresh the page and try again."
        );
      }

      // Prepare the report data
      const reportData = {
        teamName: document.getElementById("teamName").value,
        teamMember,
        teamRole,
        rows,
      };

      // Import the key from base64
      const cryptoKey = await importKeyFromBase64(key);

      // Encrypt the report data
      const { encryptedData, iv } = await encryptData(
        JSON.stringify(reportData),
        cryptoKey
      );

      // Combine IV and encrypted data
      const combinedData = new Uint8Array(iv.length + encryptedData.length);
      combinedData.set(iv, 0);
      combinedData.set(encryptedData, iv.length);

      // Convert to Base64 for transmission
      const base64Data = btoa(
        String.fromCharCode.apply(null, combinedData)
      );

      // Submit to the API
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId,
          authorId,
          data: base64Data,
          metadata: {
            isReport: true,
            authorId,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit report");
      }

      // Success!
      setSuccess(true);

      // Reset the form
      setRows([
        {
          id: Date.now(),
          platform: "",
          projectInitiative: "",
          sdlcStep: "",
          sdlcTask: "",
          taskCategory: "",
          taskDetails: "",
          estimatedTimeWithoutAI: "",
          actualTimeWithAI: "",
          aiToolUsed: [],
          complexity: "",
          qualityImpact: "",
          notesHowAIHelped: "",
        },
      ]);
      setExpandedRows({});
    } catch (err) {
      console.error("Error submitting report:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    teamMember,
    setTeamMember,
    teamMemberOptions,
    setTeamMemberOptions,
    teamRole,
    setTeamRole,
    rows,
    setRows,
    expandedRows,
    setExpandedRows,
    handleSubmit,
    isSubmitting,
    error,
    setError,
    success,
    setSuccess
  };
};

export default useReportForm;