import { useState, useEffect } from "react";

/**
 * Custom hook for managing report form state
 * Handles form data, row operations, and calculations
 */
const useReportForm = (initialReportData = null) => {
  // Form state for team information
  const [teamMember, setTeamMember] = useState("");
  const [teamRole, setTeamRole] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  // Get a new empty row with unique ID
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

  // Initialize rows state with a single empty row
  const [rows, setRows] = useState([getNewRow()]);

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
          : row
      )
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
                : updatedRow.estimatedTimeWithoutAI
            );
            const actualTime = parseFloat(
              field === "actualTimeWithAI"
                ? value
                : updatedRow.actualTimeWithAI
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
      })
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

  // Function to process report data (whether from URL param or direct props)
  const processReportData = (existingReport) => {
    if (!existingReport) return;
    
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

  // Load report data if provided
  useEffect(() => {
    if (initialReportData) {
      processReportData(initialReportData);
    }
  }, [initialReportData]);

  // Prepare report data for submission
  const prepareReportData = () => {
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

    return {
      teamMember,
      teamRole,
      entries: reportEntries
    };
  };

  // Validate form data
  const validateForm = () => {
    if (!teamMember.trim()) {
      return { valid: false, error: "Please enter your name" };
    }

    if (!teamRole.trim()) {
      return { valid: false, error: "Please enter your role" };
    }

    if (rows.length === 0) {
      return { valid: false, error: "Please add at least one entry" };
    }

    return { valid: true, error: null };
  };

  return {
    // Form state
    teamMember,
    setTeamMember,
    teamRole,
    setTeamRole,
    rows,
    isReadOnly,
    setIsReadOnly,
    expandedRows,
    
    // Row operations
    handleSDLCStepChange,
    handleRowChange,
    toggleRowExpansion,
    addRow,
    removeRow,
    
    // Form processing
    prepareReportData,
    validateForm
  };
};

export default useReportForm;