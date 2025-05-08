import { useState, useEffect } from "react";

/**
 * Custom hook for managing report form state and operations
 * 
 * @param {Object} initialData - Initial report data (if editing an existing report)
 * @returns {Object} Form state and handler functions
 */
const useReportForm = (initialData = null) => {
  const [teamMember, setTeamMember] = useState("");
  const [teamRole, setTeamRole] = useState("");
  const [rows, setRows] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Initialize form with data if provided
  useEffect(() => {
    if (initialData) {
      setTeamMember(initialData.teamMember || "");
      setTeamRole(initialData.teamRole || "");
      
      // Initialize rows from initialData or create a default row
      if (initialData.items && initialData.items.length > 0) {
        setRows(
          initialData.items.map((item) => ({
            ...item,
            id: item.id || `row-${Math.random().toString(36).substr(2, 9)}`,
          }))
        );
        
        // Initialize expanded rows
        const expanded = {};
        initialData.items.forEach((item) => {
          expanded[item.id || `row-${Math.random().toString(36).substr(2, 9)}`] = false;
        });
        setExpandedRows(expanded);
      } else {
        // Create a default row if no items exist
        addNewRow();
      }
    } else {
      // No initialData, create a default row
      addNewRow();
    }
  }, [initialData]);

  /**
   * Create a new empty row
   * @returns {Object} New row object with default values
   */
  const createNewRow = () => ({
    id: `row-${Math.random().toString(36).substr(2, 9)}`,
    platform: "",
    projectInitiative: "",
    sdlcStep: "",
    sdlcTask: "",
    taskCategory: "",
    estimatedTimeWithoutAI: "",
    actualTimeWithAI: "",
    complexity: "",
    qualityImpact: "",
    aiTools: [],
    taskNotes: "",
    aiUsageNotes: "",
  });

  /**
   * Add a new row to the form
   */
  const addNewRow = () => {
    const newRow = createNewRow();
    setRows((prevRows) => [...prevRows, newRow]);
    setExpandedRows((prev) => ({ ...prev, [newRow.id]: false }));
  };

  /**
   * Add a new empty row to the table
   */
  const addRow = () => {
    addNewRow();
  };

  /**
   * Remove a row from the table
   * @param {string} rowId - ID of the row to remove
   */
  const removeRow = (rowId) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== rowId));
    setExpandedRows((prev) => {
      const { [rowId]: _, ...rest } = prev;
      return rest;
    });
  };

  /**
   * Toggle expansion state of a row
   * @param {string} rowId - ID of the row to toggle
   */
  const toggleRowExpansion = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  /**
   * Handle changes in SDLC Step field
   * This requires special handling to clear the SDLC Task field
   * @param {string} rowId - ID of the row being modified
   * @param {string} newValue - New SDLC Step value
   */
  const handleSDLCStepChange = (rowId, newValue) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === rowId) {
          // Clear the SDLC Task when changing the SDLC Step
          return {
            ...row,
            sdlcStep: newValue,
            sdlcTask: "",
          };
        }
        return row;
      })
    );
  };

  /**
   * Handle changes in any row field
   * @param {string} rowId - ID of the row being modified
   * @param {string} field - Field name to update
   * @param {any} value - New field value
   */
  const handleRowChange = (rowId, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            [field]: value,
          };
        }
        return row;
      })
    );
  };

  /**
   * Validate the form data
   * @returns {Object} Validation result with valid flag and error message
   */
  const validateForm = () => {
    if (!teamMember.trim()) {
      return { valid: false, error: "Team Member name is required" };
    }

    if (!teamRole.trim()) {
      return { valid: false, error: "Team Role is required" };
    }

    // Make sure at least one row exists with minimum data
    if (rows.length === 0) {
      return { valid: false, error: "At least one productivity item is required" };
    }

    // Check each row for required fields
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.platform) {
        return { valid: false, error: `Row #${i + 1}: Platform is required` };
      }
      if (!row.projectInitiative) {
        return { valid: false, error: `Row #${i + 1}: Initiative is required` };
      }
      if (!row.estimatedTimeWithoutAI) {
        return { valid: false, error: `Row #${i + 1}: Estimated time is required` };
      }
      if (!row.actualTimeWithAI) {
        return { valid: false, error: `Row #${i + 1}: Actual time is required` };
      }
      if (!row.sdlcStep) {
        return { valid: false, error: `Row #${i + 1}: SDLC Step is required` };
      }
      if (!row.complexity) {
        return { valid: false, error: `Row #${i + 1}: Complexity is required` };
      }
      if (!row.qualityImpact) {
        return { valid: false, error: `Row #${i + 1}: Quality Impact is required` };
      }
      if (!row.aiTools || row.aiTools.length === 0) {
        return { valid: false, error: `Row #${i + 1}: At least one AI Tool is required` };
      }
    }

    return { valid: true };
  };

  /**
   * Prepare report data for submission
   * @returns {Object} Formatted report data
   */
  const prepareReportData = () => {
    return {
      teamMember,
      teamRole,
      items: rows,
      timestamp: new Date().toISOString(),
    };
  };

  return {
    teamMember,
    setTeamMember,
    teamRole,
    setTeamRole,
    rows,
    isReadOnly,
    setIsReadOnly,
    expandedRows,
    handleSDLCStepChange,
    handleRowChange,
    toggleRowExpansion,
    addRow,
    removeRow,
    prepareReportData,
    validateForm
  };
};

export default useReportForm;