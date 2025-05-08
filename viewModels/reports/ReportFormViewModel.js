import React from "react";
import { useRouter } from "next/router";
import { useReportForm, useReportSubmission, useReferenceData } from "../../hooks";
import ReportFormView from "../../views/reports/ReportFormView";

/**
 * ViewModel component for the Report Form
 * Uses custom hooks for separation of concerns and better reusability
 */
const ReportFormViewModel = ({
  keyFragment,
  teamName,
  teamMemberOptions = [],
  reportData = null,
  readOnly = false,
  messageIndex = null,
}) => {
  const router = useRouter();
  const { id } = router.query;

  // Use our custom hooks
  const {
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
  } = useReportForm(reportData);

  const {
    referenceData,
    isLoading: isReferenceDataLoading,
    error: referenceDataError,
    syncReferenceDataFromLocalStorage
  } = useReferenceData();

  const {
    isSubmitting,
    error: submissionError,
    successMessage,
    saveAsDraft,
    submitFinalReport,
    setError,
    setSuccessMessage
  } = useReportSubmission(id, keyFragment, teamName, messageIndex);

  // Set read-only from props
  React.useEffect(() => {
    if (readOnly) {
      setIsReadOnly(true);
    }
  }, [readOnly]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    
    // Synchronize reference data
    await syncReferenceDataFromLocalStorage();
    
    // Get form data and submit report
    const formData = prepareReportData();
    await submitFinalReport(formData, (result) => {
      // Handle successful submission if needed
      // For example, redirect to view page
      if (result?.threadId) {
        router.push(`/channel/${result.threadId}?updated=true`);
      }
    });
  };

  // Handle saving as draft
  const handleSaveAsDraft = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    
    // Synchronize reference data
    await syncReferenceDataFromLocalStorage();
    
    // Get form data and save as draft
    const formData = prepareReportData();
    await saveAsDraft(formData);
  };

  // Display loading state
  if (isReferenceDataLoading) {
    return <div>Loading reference data...</div>;
  }

  // Display error state
  if (referenceDataError) {
    return <div>Error loading reference data: {referenceDataError}</div>;
  }

  return (
    <ReportFormView
      // Pass needed properties to the view
      teamMember={teamMember}
      setTeamMember={setTeamMember}
      teamRole={teamRole}
      setTeamRole={setTeamRole}
      rows={rows}
      isReadOnly={isReadOnly}
      expandedRows={expandedRows}
      handleSDLCStepChange={handleSDLCStepChange}
      handleRowChange={handleRowChange}
      toggleRowExpansion={toggleRowExpansion}
      addRow={addRow}
      removeRow={removeRow}
      referenceData={referenceData}
      isSubmitting={isSubmitting}
      error={submissionError}
      successMessage={successMessage}
      handleSubmit={handleSubmit}
      handleSaveAsDraft={handleSaveAsDraft}
      teamMemberOptions={teamMemberOptions}
    />
  );
};

export default ReportFormViewModel;