import React, { useEffect } from "react";
import { useRouter } from "next/router";

import ReportFormView from "../views/ReportFormView";
import { useReferenceData, useReportFormMachine } from "../hooks";

/**
 * Container component for the Report Form using XState
 * Handles state management, data processing, and form submission through a state machine
 */
const ReportFormStateMachineViewModel = ({
  threadId,
  initialData = {},
  keyFragment,
  isReadOnly = false,
  existingReportIndex,
}) => {
  const router = useRouter();
  const { referenceData } = useReferenceData();

  // Use the state machine hook
  const {
    state,
    formData,
    errors,
    isSubmitting,
    isSuccess,
    isError,
    initialize,
    handleSubmit,
    handleSaveDraft,
    handleAddRow,
    handleRemoveRow,
    handleToggleRow,
    handleChange,
  } = useReportFormMachine(initialData, threadId, keyFragment);

  // Initialize the state machine when the component mounts
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Extract form data
  const { teamName, teamMember, teamRole, rows = [], expandedRows = [] } = formData;

  // Add a row to the form data
  const addRow = () => {
    handleAddRow("rows");
  };

  // Remove a row from the form data
  const removeRow = (rowIndex) => {
    handleRemoveRow(rowIndex, "rows");
  };

  // Toggle row expansion for the UI
  const toggleRowExpansion = (rowIndex) => {
    handleToggleRow(rowIndex);
  };

  // Handle input changes for form fields
  const handleRowChange = (rowId, field, value) => {
    // Find the row index
    const rowIndex = rows.findIndex((row) => row.id === rowId);
    if (rowIndex === -1) return;
    
    // Update the field in the form data
    handleChange(`rows[${rowIndex}].${field}`, value);
  };

  // Special handler for SDLC step changes that clears dependent fields
  const handleSDLCStepChange = (rowId, value) => {
    // Find the row index
    const rowIndex = rows.findIndex((row) => row.id === rowId);
    if (rowIndex === -1) return;
    
    // Update the SDLC step
    handleChange(`rows[${rowIndex}].sdlcStep`, value);
    
    // Clear the SDLC task since it depends on the step
    handleChange(`rows[${rowIndex}].sdlcTask`, "");
  };

  // Set the team member
  const setTeamMember = (value) => {
    handleChange("teamMember", value);
  };

  // Set the team role
  const setTeamRole = (value) => {
    handleChange("teamRole", value);
  };

  // Pass all state and handlers to the presentation component
  return (
    <ReportFormView
      // Form state
      teamName={teamName}
      teamMember={teamMember}
      setTeamMember={setTeamMember}
      teamRole={teamRole}
      setTeamRole={setTeamRole}
      referenceData={referenceData}
      readOnly={isReadOnly}
      rows={rows}
      expandedRows={expandedRows}
      // Row operations
      handleSDLCStepChange={handleSDLCStepChange}
      handleRowChange={handleRowChange}
      toggleRowExpansion={toggleRowExpansion}
      addRow={addRow}
      removeRow={removeRow}
      // Form processing
      handleSubmit={handleSubmit}
      handleSaveAsDraft={handleSaveDraft}
      isSubmitting={isSubmitting}
      error={isError ? state.context.message || "An error occurred while processing the form." : null}
      success={isSuccess}
      successMessage={isSuccess ? state.context.message || "Your AI productivity report has been submitted successfully!" : ""}
    />
  );
};

export default ReportFormStateMachineViewModel;