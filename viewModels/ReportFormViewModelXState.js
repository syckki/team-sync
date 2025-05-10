import React, { useEffect } from "react";
import { useRouter } from "next/router";

import ReportFormView from "../views/ReportFormView";
import { useReferenceData, useReportFormMachine } from "../hooks";

/**
 * Container component for the Report Form using XState
 * Handles state management, data processing, and form submission
 */
const ReportFormViewModelXState = ({
  keyFragment,
  teamName,
  reportData = null,
  readOnly = false,
  messageIndex = null,
}) => {
  const router = useRouter();
  const { id: threadId } = router.query;
  const { referenceData, updateData: updateReferenceData } = useReferenceData();

  // Initialize the state machine with all dependencies
  const {
    // State
    teamMember,
    teamRole,
    rows,
    expandedRows,
    isReadOnly,
    isSubmitting,
    error,
    success,
    successMessage,
    
    // Methods
    initialize,
    setTeamMember,
    setTeamRole,
    handleRowChange,
    handleSDLCStepChange,
    toggleRowExpansion,
    addRow,
    removeRow,
    saveAsDraft,
    submitForm,
  } = useReportFormMachine({
    threadId,
    keyFragment,
    teamName,
    initialReportData: reportData,
    readOnly,
    messageIndex,
    updateReferenceData,
  });

  // Initialize the state machine when the component mounts
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Create event handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    submitForm();
  };

  const handleSaveAsDraft = (e) => {
    e.preventDefault();
    saveAsDraft();
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
      handleSaveAsDraft={handleSaveAsDraft}
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      successMessage={successMessage}
    />
  );
};

export default ReportFormViewModelXState;