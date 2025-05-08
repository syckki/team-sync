import React, { useState } from "react";

import ReportFormView from "../views/ReportFormView";
import useReferenceData from "../hooks/data/useReferenceData";
import useReportForm from "../hooks/form/useReportForm";

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
    // Form processing
    prepareReportData,
  } = useReportForm({
    keyFragment,
    readOnly,
    initialReportData: reportData,
    messageIndex,
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Handle saving as draft
  const handleSaveAsDraft = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Synchronize reference data from localStorage to the backend
      await updateData();

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
      await updateData();

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
