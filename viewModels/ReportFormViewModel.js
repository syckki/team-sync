import React from "react";
import { useRouter } from "next/router";

import ReportFormView from "../views/ReportFormView";
import { useReferenceData, useReportForm, useReportSubmission } from "../hooks";

/**
 * Container component for the Report Form
 * Handles state management, data processing, and form submission
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

  const {
    // Form state
    teamMember,
    setTeamMember,
    teamRole,
    setTeamRole,
    isReadOnly,
    rows,
    setRows,
    expandedRows,
    setExpandedRows,
    // Row operations
    handleSDLCStepChange,
    handleRowChange,
    toggleRowExpansion,
    addRow,
    removeRow,
    getNewRow,
    // Form processing
    prepareFormData,
  } = useReportForm({
    readOnly,
    teamName,
    initialReportData: reportData,
  });

  // Submission state management using the hook
  const {
    submitReport,
    isSubmitting,
    error,
    success,
    successMessage,
    resetStatus,
    redirectToChannelInbox
  } = useReportSubmission(threadId, keyFragment, messageIndex);

  // Handle saving as draft
  const handleSaveAsDraft = async (e) => {
    e.preventDefault();

    try {
      // Synchronize reference data from localStorage to the backend
      await updateData();

      const formData = prepareFormData();

      // Submit as draft using the submission hook
      const success = await submitReport(formData, "draft", teamName);

      // On success, redirect to channel inbox
      if (success) {
        redirectToChannelInbox();
      }
    } catch (err) {
      console.error("Error preparing draft:", err);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Synchronize reference data from localStorage to the backend
      await updateData();

      const formData = prepareFormData();

      // Submit as final using the submission hook
      const success = await submitReport(formData, "submitted", teamName);

      // Reset form and redirect to channel inbox
      if (success) {
        // Reset the form for future use in case user navigates back
        setRows([getNewRow()]);
        setExpandedRows({});
        setTeamMember("");
        setTeamRole("");
        
        // Redirect to channel inbox
        redirectToChannelInbox();
      }
    } catch (err) {
      console.error("Error preparing submission:", err);
    }
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

export default ReportFormViewModel;
