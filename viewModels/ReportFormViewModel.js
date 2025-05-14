import { useEffect } from "react";
import { useRouter } from "next/router";

import ReportFormView from "../views/ReportFormView";
import { useReportForm } from "../hooks";

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

  const {
    // Form state
    teamMember,
    setTeamMember,
    teamRole,
    setTeamRole,
    isReadOnly,
    rows,
    expandedRows,
    referenceData,

    isSubmitting,
    error,
    success,
    // Row operations
    handleSDLCStepChange,
    handleRowChange,
    toggleRowExpansion,
    addRow,
    removeRow,
    // Form processing
    submitReport,
  } = useReportForm({
    readOnly,
    initialReportData: reportData,
  });

  // Handle form submission
  const handleSubmit = (status) => async (e) => {
    e.preventDefault();
    submitReport(status, teamName, threadId, keyFragment, messageIndex);
  };

  useEffect(() => {
    if (!success) return;
    // Redirect to the thread page after successful submission
    router.push(`/channel/${threadId}#${keyFragment}`);
  }, [success]);

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
    />
  );
};

export default ReportFormViewModel;
