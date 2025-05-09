import React, { useEffect } from "react";
import { useRouter } from "next/router";

import ReportFormView from "../views/ReportFormView";
import { useReferenceData, useReportFormMachine } from "../hooks";

/**
 * Container component for the Report Form
 * Handles state management, data processing, and form submission
 * Uses XState state machine for more robust state management
 */
const ReportFormViewModel = ({
  keyFragment,
  teamName,
  reportData = null,
  readOnly = false,
  messageIndex = null,
}) => {
  const router = useRouter();
  const { id: threadId } = router.query;
  const { referenceData, updateData } = useReferenceData();

  // Use the XState-based report form machine
  const {
    // Form state
    teamMember,
    setTeamMember,
    teamRole,
    setTeamRole,
    isReadOnly,
    rows,
    expandedRows,
    // Row operations
    handleSDLCStepChange,
    handleRowChange,
    toggleRowExpansion,
    addRow,
    removeRow,
    // Form processing
    handleSubmit,
    handleSaveAsDraft,
    isSubmitting,
    error,
    success,
    successMessage
  } = useReportFormMachine({
    teamName,
    keyFragment,
    threadId,
    messageIndex,
    reportData,
    readOnly,
    router,
  });

  // Synchronize reference data when submission succeeds
  useEffect(() => {
    if (success) {
      // Update reference data in the background
      updateData().catch(err => {
        console.error("Error updating reference data:", err);
      });
    }
  }, [success, updateData]);

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

export default ReportFormViewModel;
