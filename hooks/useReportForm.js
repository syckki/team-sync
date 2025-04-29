import { useState, useEffect } from "react";
import { encryptData } from "../lib/cryptoUtils";

/**
 * Custom hook for managing report form state and submission
 * 
 * @param {Object} options Configuration options
 * @param {string} options.threadId Thread ID for the report
 * @param {string} options.threadTitle Default team name from thread title
 * @param {Object} options.cryptoKey CryptoKey object for encryption
 * @param {Function} options.onSuccess Success callback
 * @param {Function} options.onError Error callback
 * @returns {Object} Form state and handlers
 */
const useReportForm = ({
  threadId,
  threadTitle,
  cryptoKey,
  onSuccess,
  onError
}) => {
  // Team information state
  const [teamName, setTeamName] = useState(threadTitle || "");
  const [teamMember, setTeamMember] = useState("");
  const [teamMemberOptions, setTeamMemberOptions] = useState([]);
  const [teamRole, setTeamRole] = useState("");
  
  // Task rows state
  const [rows, setRows] = useState([
    createEmptyRow()
  ]);
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Function to create an empty row with a unique ID
  function createEmptyRow() {
    return {
      id: Date.now(),
      platform: "",
      projectInitiative: "",
      sdlcStep: "",
      sdlcTask: "",
      taskCategory: "",
      taskDetails: "",
      estimatedTimeWithoutAI: "",
      actualTimeWithAI: "",
      timeSaved: "",
      aiToolUsed: [],
      complexity: "",
      qualityImpact: "",
      notesHowAIHelped: "",
    };
  }
  
  // Load team member options from localStorage
  useEffect(() => {
    try {
      const savedOptions = localStorage.getItem("teamMemberOptions");
      if (savedOptions) {
        setTeamMemberOptions(JSON.parse(savedOptions));
      }
    } catch (err) {
      console.error("Error loading team member options:", err);
    }
  }, []);
  
  // Save team member to localStorage when it changes
  const saveTeamMemberToStorage = (member) => {
    if (!teamMemberOptions.includes(member) && member.trim()) {
      const updatedOptions = [...teamMemberOptions, member];
      setTeamMemberOptions(updatedOptions);
      localStorage.setItem("teamMemberOptions", JSON.stringify(updatedOptions));
    }
  };
  
  // Function to round time to the nearest quarter hour (0.00, 0.25, 0.50, 0.75)
  const roundToQuarterHour = (time) => {
    const value = parseFloat(time) || 0;
    return (Math.round(value * 4) / 4).toFixed(2);
  };
  
  // Handle SDLC step change
  const handleSDLCStepChange = (id, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id
          ? { ...row, sdlcStep: value, sdlcTask: "" } // Reset task when step changes
          : row
      )
    );
  };
  
  // Handle changes to any row field
  const handleRowChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };

          // If changing time fields, apply quarter-hour rounding
          if (
            field === "estimatedTimeWithoutAI" ||
            field === "actualTimeWithAI"
          ) {
            // Round to nearest quarter hour
            if (field === "estimatedTimeWithoutAI") {
              updatedRow.estimatedTimeWithoutAI = roundToQuarterHour(value);
            }
            if (field === "actualTimeWithAI") {
              updatedRow.actualTimeWithAI = roundToQuarterHour(value);
            }
          }

          // Auto-calculate timeSaved if both time fields have values
          if (
            (field === "estimatedTimeWithoutAI" ||
              field === "actualTimeWithAI") &&
            updatedRow.estimatedTimeWithoutAI &&
            updatedRow.actualTimeWithAI
          ) {
            const estimated = parseFloat(updatedRow.estimatedTimeWithoutAI);
            const actual = parseFloat(updatedRow.actualTimeWithAI);
            updatedRow.timeSaved = (estimated - actual).toFixed(2);
          }

          return updatedRow;
        }
        return row;
      })
    );
  };
  
  // Add a new row
  const addRow = () => {
    setRows([...rows, createEmptyRow()]);
  };
  
  // Delete a row
  const deleteRow = (id) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((row) => row.id !== id));
  };
  
  // Form validation
  const validateForm = () => {
    if (!teamName.trim() || !teamMember.trim() || !teamRole.trim()) {
      throw new Error("Please fill in all team information fields");
    }

    // Validate rows
    for (const row of rows) {
      if (
        !row.platform ||
        !row.projectInitiative ||
        !row.sdlcStep ||
        !row.sdlcTask ||
        !row.taskCategory ||
        !row.taskDetails ||
        !row.estimatedTimeWithoutAI ||
        !row.actualTimeWithAI ||
        !row.aiToolUsed ||
        row.aiToolUsed.length === 0 ||
        !row.complexity ||
        !row.qualityImpact ||
        !row.notesHowAIHelped
      ) {
        throw new Error("Please fill in all fields for each task entry");
      }
    }
    
    return true;
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!cryptoKey) {
        throw new Error("Encryption key not found");
      }
      
      // Validate form
      validateForm();
      
      // Prepare report data
      const reportData = {
        teamName,
        teamMember,
        teamRole,
        tasks: rows.map((row) => ({
          platform: row.platform,
          projectInitiative: row.projectInitiative,
          sdlcStep: row.sdlcStep,
          sdlcTask: row.sdlcTask,
          taskCategory: row.taskCategory,
          taskDetails: row.taskDetails,
          estimatedTimeWithoutAI: row.estimatedTimeWithoutAI,
          actualTimeWithAI: row.actualTimeWithAI,
          timeSaved: row.timeSaved,
          aiToolUsed: row.aiToolUsed,
          complexity: row.complexity,
          qualityImpact: row.qualityImpact,
          notesHowAIHelped: row.notesHowAIHelped,
        })),
        timestamp: new Date().toISOString(),
      };
      
      // Convert to JSON and then to ArrayBuffer for encryption
      const jsonData = JSON.stringify(reportData);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(jsonData);

      // Encrypt the data
      const encryptedData = await encryptData(dataBuffer, cryptoKey);

      // Convert ArrayBuffer to base64 for sending to server
      const bytes = new Uint8Array(encryptedData);
      let base64 = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        base64 += String.fromCharCode(bytes[i]);
      }
      const base64Data = btoa(base64);

      // Get author ID from localStorage or generate a new one
      let authorId = localStorage.getItem("encrypted-app-author-id");
      if (!authorId) {
        authorId = `author-${Math.random().toString(36).substring(2, 10)}-${Math.random()
          .toString(36)
          .substring(2, 8)}`;
        localStorage.setItem("encrypted-app-author-id", authorId);
      }

      // Send to server
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId,
          data: base64Data,
          metadata: {
            authorId,
            timestamp: new Date().toISOString(),
            isReport: true, // Flag this as a report for filtering
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      // Save team member to localStorage
      saveTeamMemberToStorage(teamMember);
      
      // Reset form state
      setRows([createEmptyRow()]);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      if (onError) {
        onError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    // Form state
    teamName,
    setTeamName,
    teamMember,
    setTeamMember,
    teamMemberOptions,
    teamRole,
    setTeamRole,
    rows,
    isSubmitting,
    
    // Row handlers
    handleSDLCStepChange,
    handleRowChange,
    addRow,
    deleteRow,
    
    // Form submission
    handleSubmit,
    validateForm
  };
};

export default useReportForm;