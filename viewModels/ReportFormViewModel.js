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
    expandedRows,
    // Row operations
    handleSDLCStepChange,
    handleRowChange,
    toggleRowExpansion,
    addRow,
    removeRow,
    // Form processing
    prepareFormData,
  } = useReportForm({
    readOnly,
    teamName,
    initialReportData: reportData,
  });

  // Submission state management using the hook
  const { submitReport, isSubmitting, error, success, successMessage } =
    useReportSubmission(threadId, keyFragment, messageIndex);

  // Handle form submission
  const handleSubmit = (status) => async (e) => {
    e.preventDefault();

    try {
      const formData = prepareFormData();

      // Submit as final using the submission hook
      const microtask1 = submitReport(formData, status, teamName);
      // Synchronize reference data from localStorage to the backend
      const microtask2 = updateData();

      const [success] = await Promise.all([microtask1, microtask2]);

      // Reset form and redirect to channel inbox
      if (success) {
        setTimeout(() => {
          router.push(`/channel/${threadId}#${keyFragment}`);
        }, 3000);
      }
    } catch (err) {
      console.error("Error submitting report:", err);
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
      handleSubmit={handleSubmit("submitted")}
      handleSaveAsDraft={handleSubmit("draft")}
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      successMessage={successMessage}
    />
  );
};

export default ReportFormViewModel;
