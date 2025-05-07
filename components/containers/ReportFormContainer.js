import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { importKeyFromBase64, encryptData } from "../../lib/cryptoUtils";
import { getAllReferenceData, updateReferenceDataCategory } from "../../lib/referenceDataClient";
import ReportForm from "../presentational/ReportForm";

/**
 * Container component for the Report Form
 * Handles state management, data processing, and form submission
 */
const ReportFormContainer = ({
  keyFragment,
  teamName,
  teamMemberOptions = [],
  reportData = null,
  readOnly = false,
  messageIndex = null,
}) => {
  const router = useRouter();
  const { id } = router.query;

  // Set up state for read-only mode (for submitted reports)
  // Allow override from props (for messageIndex-based loading)
  const [isReadOnly, setIsReadOnly] = useState(readOnly);

  // Form state
  const [teamMember, setTeamMember] = useState("");
  const [teamRole, setTeamRole] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  
  // Reference data state
  const [referenceData, setReferenceData] = useState({
    platforms: [],
    projectInitiatives: [],
    sdlcSteps: [],
    sdlcTasksMap: {},
    taskCategories: [],
    complexityLevels: [],
    qualityImpacts: [],
    aiTools: []
  });
  
  // Synchronize localStorage data with API
  const syncReferenceDataFromLocalStorage = async () => {
    try {
      // Map of localStorage keys to API category names
      const storageKeyMap = {
        "platformOptions": "platforms",
        "projectOptions": "projectInitiatives",
        "sdlcStepOptions": "sdlcSteps",
        "taskCategoryOptions": "taskCategories",
        "qualityImpactOptions": "qualityImpacts",
        "aiToolOptions": "aiTools"
      };
      
      // For each storage key, check if there are additional items to sync
      for (const [storageKey, categoryName] of Object.entries(storageKeyMap)) {
        const storedItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        if (storedItems.length === 0) continue;
        
        // Check if there are any items in localStorage that are not in the API data
        const apiItems = referenceData[categoryName] || [];
        const newItems = storedItems.filter(item => !apiItems.includes(item));
        
        // If there are new items, update the API
        if (newItems.length > 0) {
          const updatedItems = [...apiItems, ...newItems];
          await updateReferenceDataCategory(categoryName, updatedItems);
          
          // Update local reference data state
          setReferenceData(prev => ({
            ...prev,
            [categoryName]: updatedItems
          }));
        }
      }
      
      // Handle sdlcTasksMap separately (it's an object mapping SDLC steps to arrays of tasks)
      try {
        const sdlcTaskOptionsMap = JSON.parse(localStorage.getItem("sdlcTaskOptionsMap") || '{}');
        let hasUpdates = false;
        const updatedTasksMap = { ...referenceData.sdlcTasksMap };
        
        // Check for each step if there are new tasks
        Object.entries(sdlcTaskOptionsMap).forEach(([step, tasks]) => {
          if (!Array.isArray(tasks) || tasks.length === 0) return;
          
          // If the step doesn't exist in the API data, create it
          if (!updatedTasksMap[step]) {
            updatedTasksMap[step] = tasks;
            hasUpdates = true;
            return;
          }
          
          // Check for new tasks for this step
          const apiTasks = updatedTasksMap[step] || [];
          const newTasks = tasks.filter(task => !apiTasks.includes(task));
          
          if (newTasks.length > 0) {
            updatedTasksMap[step] = [...apiTasks, ...newTasks];
            hasUpdates = true;
          }
        });
        
        // If there were updates, save to the API
        if (hasUpdates) {
          await updateReferenceDataCategory("sdlcTasksMap", updatedTasksMap);
          
          // Update local reference data state
          setReferenceData(prev => ({
            ...prev,
            sdlcTasksMap: updatedTasksMap
          }));
        }
      } catch (taskMapError) {
        console.error("Error synchronizing SDLC task map:", taskMapError);
      }
    } catch (error) {
      console.error("Error synchronizing reference data:", error);
    }
  };
  
  // Update localStorage from API reference data
  const updateLocalStorageFromAPI = (data) => {
    try {
      // Map of API category names to localStorage keys
      const categoryKeyMap = {
        "platforms": "platformOptions",
        "projectInitiatives": "projectOptions",
        "sdlcSteps": "sdlcStepOptions",
        "taskCategories": "taskCategoryOptions",
        "qualityImpacts": "qualityImpactOptions",
        "aiTools": "aiToolOptions"
      };
      
      // For each API category, update localStorage
      Object.entries(categoryKeyMap).forEach(([categoryName, storageKey]) => {
        const apiItems = data[categoryName] || [];
        if (apiItems.length === 0) return;
        
        // Get existing items from localStorage
        const storedItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Merge items, ensuring uniqueness
        const mergedItems = [...new Set([...storedItems, ...apiItems])];
        
        // Update localStorage
        localStorage.setItem(storageKey, JSON.stringify(mergedItems));
      });
      
      // Handle sdlcTasksMap separately
      if (data.sdlcTasksMap) {
        const existingTaskMap = JSON.parse(localStorage.getItem("sdlcTaskOptionsMap") || '{}');
        const updatedTaskMap = { ...existingTaskMap };
        
        // Merge each step's tasks
        Object.entries(data.sdlcTasksMap).forEach(([step, tasks]) => {
          const existingTasks = updatedTaskMap[step] || [];
          updatedTaskMap[step] = [...new Set([...existingTasks, ...tasks])];
        });
        
        // Update localStorage
        localStorage.setItem("sdlcTaskOptionsMap", JSON.stringify(updatedTaskMap));
      }
    } catch (error) {
      console.error("Error updating localStorage from API:", error);
    }
  };

  // Fetch reference data on component mount and synchronize with localStorage
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const data = await getAllReferenceData();
        if (data) {
          setReferenceData(data);
          
          // First update localStorage with API data
          updateLocalStorageFromAPI(data);
          
          // Then synchronize any new items from localStorage back to the API
          await syncReferenceDataFromLocalStorage();
        }
      } catch (error) {
        console.error("Error fetching reference data:", error);
      }
    };
    
    fetchReferenceData();
  }, []);

  const getNewRow = () => ({
    id: Date.now(),
    platform: "",
    projectInitiative: "",
    sdlcStep: "",
    sdlcTask: "",
    taskCategory: "",
    estimatedTimeWithoutAI: "",
    actualTimeWithAI: "",
    timeSaved: "", // is calculated
    complexity: "",
    qualityImpact: "",
    aiToolsUsed: [],
    taskDetails: "",
    notesHowAIHelped: "",
  });

  const [rows, setRows] = useState([getNewRow()]);

  // Function to process report data (whether from URL param or direct props)
  const processReportData = (existingReport) => {
    // Check report status - if submitted, set read-only mode
    if (existingReport.status === "submitted") {
      setIsReadOnly(true);
    }

    // Set team member and role
    setTeamMember(existingReport.teamMember || "");
    setTeamRole(existingReport.teamRole || "");

    // Load rows data if available
    if (existingReport.entries && existingReport.entries.length > 0) {
      // Map the entries to row format with unique IDs
      const loadedRows = existingReport.entries.map((entry) => ({
        id: Date.now() + Math.floor(Math.random() * 1000), // Generate unique id
        platform: entry.platform,
        projectInitiative: entry.projectInitiative,
        sdlcStep: entry.sdlcStep,
        sdlcTask: entry.sdlcTask,
        taskCategory: entry.taskCategory,
        estimatedTimeWithoutAI: entry.estimatedTimeWithoutAI || "",
        actualTimeWithAI: entry.actualTimeWithAI || "",
        complexity: entry.complexity || "",
        qualityImpact: entry.qualityImpact || "",
        aiToolsUsed: entry.aiToolsUsed
          ? Array.isArray(entry.aiToolsUsed)
            ? entry.aiToolsUsed
            : entry.aiToolsUsed.includes(",")
              ? entry.aiToolsUsed.split(",").map((t) => t.trim())
              : [entry.aiToolsUsed]
          : [],
        taskDetails: entry.taskDetails,
        notesHowAIHelped: entry.notesHowAIHelped || "",
      }));

      setRows(loadedRows);
    }
  };

  // Load report data from props (passed from page component)
  useEffect(() => {
    if (reportData) {
      processReportData(reportData);
    }
  }, [reportData]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
              updatedRow.timeSaved = roundToQuarterHour(timeSaved);
            } else {
              updatedRow.timeSaved = "";
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
    const newRow = getNewRow();
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
      platform: row.platform,
      projectInitiative: row.projectInitiative,
      sdlcStep: row.sdlcStep,
      sdlcTask: row.sdlcTask,
      taskCategory: row.taskCategory,
      estimatedTimeWithoutAI: roundToQuarterHour(row.estimatedTimeWithoutAI),
      actualTimeWithAI: roundToQuarterHour(row.actualTimeWithAI),
      timeSaved: row.timeSaved,
      complexity: row.complexity,
      qualityImpact: row.qualityImpact,
      aiToolsUsed:
        Array.isArray(row.aiToolsUsed) && row.aiToolsUsed.length > 0
          ? row.aiToolsUsed.join(", ")
          : "",
      taskDetails: row.taskDetails,
      notesHowAIHelped: row.notesHowAIHelped,
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
    const submitData = {
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

    // If we're editing an existing message, include the messageIndex
    if (messageIndex !== null) {
      submitData.messageIndex = messageIndex;
    }

    return submitData;
  };

  // Handle saving as draft
  const handleSaveAsDraft = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Synchronize reference data from localStorage to the backend
      await syncReferenceDataFromLocalStorage();
      
      const submitData = await prepareReportData("draft");

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

      setSuccessMessage(
        "Your AI productivity report has been saved as a draft!",
      );
      setSuccess(true);

      // Show success message but don't reset form
      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage("");
      }, 3000);
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
      // Synchronize reference data from localStorage to the backend
      await syncReferenceDataFromLocalStorage();
      
      const submitData = await prepareReportData("submitted");

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

      setSuccessMessage(
        "Your AI productivity report has been submitted successfully!",
      );
      setSuccess(true);

      // Reset the form after a delay
      setTimeout(() => {
        setRows([getNewRow()]);
        setExpandedRows({});
        setTeamMember("");
        setTeamRole("");
        setSuccess(false);
        setSuccessMessage("");
      }, 3000);
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
      readOnly={isReadOnly} // Pass readOnly to the form
      referenceData={referenceData} // Pass reference data to the form
    />
  );
};

export default ReportFormContainer;
