import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  importKeyFromBase64,
  encryptData,
  exportKeyToBase64,
} from "../../lib/cryptoUtils";
import ReportForm from "../presentational/ReportForm";

/**
 * Container component for the Report Form
 * Handles state management, data processing, and form submission
 */
const ReportFormContainer = ({
  keyFragment,
  teamName,
  teamMemberOptions = [],
  reportData = null, // Default to null, passed when editing a report
  messageIndex = null, // The message index for updating the report
  isEditMode = false // Whether we're editing an existing report
}) => {
  const router = useRouter();
  const { id } = router.query;

  // Form state initialized with default values
  const [teamMember, setTeamMember] = useState("");
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

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Initialize form with report data if editing
  useEffect(() => {
    if (isEditMode && reportData) {
      // Set team information
      setTeamMember(reportData.teamMember || "");
      setTeamRole(reportData.teamRole || "");
      
      // Initialize rows from entries
      if (reportData.entries && reportData.entries.length > 0) {
        const newRows = reportData.entries.map(entry => ({
          id: entry.id || Date.now() + Math.random() * 1000, // Generate a unique ID if none exists
          platform: entry.platform || "",
          projectInitiative: entry.projectInitiative || "",
          sdlcStep: entry.sdlcStep || "",
          sdlcTask: entry.sdlcTask || "",
          taskCategory: entry.taskCategory || "",
          taskDetails: entry.taskDetails || "",
          estimatedTimeWithoutAI: entry.estimatedTimeWithoutAI || "",
          actualTimeWithAI: entry.actualTimeWithAI || "",
          aiToolUsed: entry.aiToolUsed || [],
          complexity: entry.complexity || "",
          qualityImpact: entry.qualityImpact || "",
          notesHowAIHelped: entry.notesHowAIHelped || "",
        }));
        
        setRows(newRows);
        
        // Set all rows to expanded by default in edit mode
        const expandedState = {};
        newRows.forEach(row => {
          expandedState[row.id] = true;
        });
        
        setExpandedRows(expandedState);
      }
    }
  }, [isEditMode, reportData]);

  // Function to round time to the nearest quarter hour (0.00, 0.25, 0.50, 0.75)
  const roundToQuarterHour = (time) => {
    const value = parseFloat(time) || 0;
    return (Math.round(value * 4) / 4).toFixed(2);
  };

  // Handle SDLC step change and reset the task when step changes
  const handleSDLCStepChange = (id, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id
          ? { ...row, sdlcStep: value, sdlcTask: "" } // Reset task when step changes
          : row,
      ),
    );
  };

  // Handle general field changes in form rows
  const handleRowChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };

          // Calculate time saved if both time fields are filled
          if (
            field === "estimatedTimeWithoutAI" ||
            field === "actualTimeWithAI"
          ) {
            const estimatedTime = parseFloat(
              field === "estimatedTimeWithoutAI"
                ? value
                : updatedRow.estimatedTimeWithoutAI,
            );
            const actualTime = parseFloat(
              field === "actualTimeWithAI"
                ? value
                : updatedRow.actualTimeWithAI,
            );

            if (!isNaN(estimatedTime) && !isNaN(actualTime)) {
              const timeSaved = Math.max(0, estimatedTime - actualTime);
              updatedRow.hoursSaved = roundToQuarterHour(timeSaved);
            } else {
              updatedRow.hoursSaved = "";
            }
          }

          return updatedRow;
        }
        return row;
      }),
    );
  };

  // Toggle row expansion
  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Add a new row to the form
  const addRow = () => {
    const newRow = {
      id: Date.now(),
      platform: "",
      projectInitiative: "",
      sdlcStep: "",
      sdlcTask: "",
      taskCategory: "",
      taskDetails: "",
      estimatedTimeWithoutAI: "",
      actualTimeWithAI: "",
      hoursSaved: "",
      aiToolUsed: [],
      complexity: "",
      qualityImpact: "",
      notesHowAIHelped: "",
    };
    setRows((prevRows) => [...prevRows, newRow]);
    // Automatically expand the new row
    setExpandedRows((prev) => ({
      ...prev,
      [newRow.id]: true,
    }));
  };

  // Remove a row from the form
  const removeRow = (id) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
    // Also remove from expanded state
    setExpandedRows((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  // Common function to process and prepare report data
  const prepareReportData = async (status = "submitted") => {
    // Basic validation
    if (!teamMember.trim()) {
      throw new Error("Please enter your name");
    }

    if (!teamRole.trim()) {
      throw new Error("Please enter your role");
    }

    if (rows.length === 0) {
      throw new Error("Please add at least one entry");
    }

    // Process the form data
    const reportEntries = rows.map((row) => ({
      sdlcStep: row.sdlcStep,
      sdlcTask: row.sdlcTask,
      platform: row.platform,
      projectInitiative: row.projectInitiative,
      taskCategory: row.taskCategory,
      taskDetails: row.taskDetails,
      hours: roundToQuarterHour(row.actualTimeWithAI),
      aiTool:
        Array.isArray(row.aiToolUsed) && row.aiToolUsed.length > 0
          ? row.aiToolUsed.join(", ")
          : "",
      aiProductivity: row.notesHowAIHelped,
      hoursSaved: row.hoursSaved,
      complexity: row.complexity,
      qualityImpact: row.qualityImpact,
    }));

    // Add author ID if available (for multi-user identification)
    const authorId = localStorage.getItem("encrypted-app-author-id");

    // Create the report object
    const reportData = {
      teamName,
      teamMember,
      teamRole,
      timestamp: new Date().toISOString(),
      entries: reportEntries,
      status, // Add status field: 'draft' or 'submitted'
      authorId,
    };

    // Import the key to use for encryption
    const cryptoKey = await importKeyFromBase64(keyFragment);

    // Encrypt the report data
    const jsonData = JSON.stringify(reportData);
    const { ciphertext, iv } = await encryptData(jsonData, cryptoKey);

    // Convert the combined ciphertext and IV to ArrayBuffer for upload
    const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
    combinedData.set(iv, 0);
    combinedData.set(new Uint8Array(ciphertext), iv.length);

    // Prepare the report submission
    return {
      threadId: id,
      threadTitle: teamName,
      data: Array.from(combinedData), // <-- Convert the ArrayBuffer to array of bytes
      metadata: {
        authorId,
        isReport: true,
        timestamp: new Date().toISOString(),
        status, // Add status to metadata
      },
    };
  };

  // Handle saving as draft
  const handleSaveAsDraft = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = await prepareReportData("draft");
      
      // If we're in edit mode and have a messageIndex, we're updating an existing message
      if (isEditMode && messageIndex !== null) {
        // Update the index in submitData to match the original message
        submitData.messageIndex = messageIndex;
        
        // Additional metadata to indicate this is an update
        submitData.metadata.isUpdate = true;
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
        throw new Error("Error saving draft. Please try again.");
      }

      // Save the team member name for future use if it's new
      if (teamMember && !teamMemberOptions.includes(teamMember)) {
        try {
          const updatedOptions = [...teamMemberOptions, teamMember];
          localStorage.setItem(
            "teamMemberOptions",
            JSON.stringify(updatedOptions),
          );
        } catch (localStorageErr) {
          console.error("Error saving team member option:", localStorageErr);
          // Non-critical error, continue
        }
      }

      const updatingMessage = isEditMode ? "updated" : "saved as a draft";
      setSuccessMessage(
        `Your AI productivity report has been ${updatingMessage}!`,
      );
      setSuccess(true);

      // If we're in edit mode, redirect back to the channel after a delay
      if (isEditMode) {
        setTimeout(() => {
          window.location.href = `/channel/${id}#${keyFragment}`;
        }, 2000);
      } else {
        // Show success message but don't reset form if not in edit mode
        setTimeout(() => {
          setSuccess(false);
          setSuccessMessage("");
        }, 3000);
      }
    } catch (err) {
      console.error("Error saving draft:", err);
      setError(err.message || "Error saving draft. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = await prepareReportData("submitted");
      
      // If we're in edit mode and have a messageIndex, we're updating an existing message
      if (isEditMode && messageIndex !== null) {
        // Update the index in submitData to match the original message
        submitData.messageIndex = messageIndex;
        
        // Additional metadata to indicate this is an update
        submitData.metadata.isUpdate = true;
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
        throw new Error("Error submitting report. Please try again.");
      }

      // Save the team member name for future use if it's new
      if (teamMember && !teamMemberOptions.includes(teamMember)) {
        try {
          const updatedOptions = [...teamMemberOptions, teamMember];
          localStorage.setItem(
            "teamMemberOptions",
            JSON.stringify(updatedOptions),
          );
        } catch (localStorageErr) {
          console.error("Error saving team member option:", localStorageErr);
          // Non-critical error, continue
        }
      }

      const submittedMessage = isEditMode 
        ? "Your draft has been finalized and submitted successfully!" 
        : "Your AI productivity report has been submitted successfully!";
        
      setSuccessMessage(submittedMessage);
      setSuccess(true);

      // If we're in edit mode, redirect back to the channel after a delay
      if (isEditMode) {
        setTimeout(() => {
          window.location.href = `/channel/${id}#${keyFragment}`;
        }, 2000);
      } else {
        // Reset the form after a delay for new submissions
        setTimeout(() => {
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
              hoursSaved: "",
              aiToolUsed: [],
              complexity: "",
              qualityImpact: "",
              notesHowAIHelped: "",
            },
          ]);
          setExpandedRows({});
          setTeamMember("");
          setTeamRole("");
          setSuccess(false);
          setSuccessMessage("");
        }, 3000);
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      setError(err.message || "Error submitting report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pass all state and handlers to the presentation component
  return (
    <ReportForm
      teamName={teamName}
      teamMember={teamMember}
      setTeamMember={setTeamMember}
      teamRole={teamRole}
      setTeamRole={setTeamRole}
      rows={rows}
      expandedRows={expandedRows}
      toggleRowExpansion={toggleRowExpansion}
      handleRowChange={handleRowChange}
      handleSDLCStepChange={handleSDLCStepChange}
      addRow={addRow}
      removeRow={removeRow}
      handleSubmit={handleSubmit}
      handleSaveAsDraft={handleSaveAsDraft}
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      successMessage={successMessage}
      teamMemberOptions={teamMemberOptions}
      isEditMode={isEditMode}
    />
  );
};

export default ReportFormContainer;
