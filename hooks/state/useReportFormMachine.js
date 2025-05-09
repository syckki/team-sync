import { useCallback } from 'react';
import { useMachine } from '@xstate/react';
import { createReportFormMachine } from '../../machines/reportFormMachine';
import { importKeyFromBase64, encryptData } from '../../lib/cryptoUtils';

/**
 * Custom hook that integrates the report form state machine
 * Manages the complete form state and handles transitions between states
 */
const useReportFormMachine = ({
  teamName,
  keyFragment,
  threadId,
  messageIndex,
  reportData,
  readOnly,
  router,
}) => {
  // Create and use the state machine
  const [state, send] = useMachine(() => 
    createReportFormMachine({
      teamName,
      readOnly,
      initialReportData: reportData,
      threadId,
      keyFragment,
      messageIndex,
      router,
    }),
    {
      services: {
        // Handle report submission
        saveDraft: async (context) => {
          return await submitReport(context, 'draft');
        },
        submitFinal: async (context) => {
          return await submitReport(context, 'submitted');
        },
      }
    }
  );

  // Extract context and state values
  const { 
    teamMember, 
    teamRole, 
    isReadOnly, 
    rows, 
    expandedRows,
    error,
    success,
    successMessage,
  } = state.context;

  // Calculate derived state
  const isSubmitting = state.matches('submitting') || state.matches('savingDraft');

  // Event handlers
  const setTeamMember = useCallback((value) => {
    send({ type: 'UPDATE_TEAM_MEMBER', value });
  }, [send]);

  const setTeamRole = useCallback((value) => {
    send({ type: 'UPDATE_TEAM_ROLE', value });
  }, [send]);

  const handleSDLCStepChange = useCallback((id, value) => {
    send({ type: 'UPDATE_SDLC_STEP', id, value });
  }, [send]);

  const handleRowChange = useCallback((id, field, value) => {
    send({ type: 'UPDATE_ROW_FIELD', id, field, value });
  }, [send]);

  const toggleRowExpansion = useCallback((id) => {
    send({ type: 'TOGGLE_ROW', id });
  }, [send]);

  const addRow = useCallback(() => {
    send({ type: 'ADD_ROW' });
  }, [send]);

  const removeRow = useCallback((id) => {
    send({ type: 'REMOVE_ROW', id });
  }, [send]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    send({ type: 'SUBMIT' });
  }, [send]);

  const handleSaveAsDraft = useCallback((e) => {
    e.preventDefault();
    send({ type: 'SAVE_DRAFT' });
  }, [send]);

  const retry = useCallback(() => {
    send({ type: 'RETRY' });
  }, [send]);

  // Helper function to handle report submission
  const submitReport = async (context, status) => {
    try {
      // Get author ID for multi-user identification
      const authorId = localStorage.getItem("encrypted-app-author-id");

      // Prepare form data
      const formData = {
        teamName: context.teamName,
        teamMember: context.teamMember,
        teamRole: context.teamRole,
        entries: context.rows.map(row => ({
          platform: row.platform,
          projectInitiative: row.projectInitiative,
          sdlcStep: row.sdlcStep,
          sdlcTask: row.sdlcTask,
          taskCategory: row.taskCategory,
          estimatedTimeWithoutAI: row.estimatedTimeWithoutAI,
          actualTimeWithAI: row.actualTimeWithAI,
          timeSaved: row.timeSaved,
          complexity: row.complexity,
          qualityImpact: row.qualityImpact,
          aiToolsUsed: Array.isArray(row.aiToolsUsed) && row.aiToolsUsed.length > 0
            ? row.aiToolsUsed.join(", ")
            : "",
          taskDetails: row.taskDetails,
          notesHowAIHelped: row.notesHowAIHelped,
        })),
      };

      // Add system fields to the form data
      const completeReportData = {
        ...formData,
        timestamp: new Date().toISOString(),
        status,
        authorId,
      };

      // Import the key to use for encryption
      const cryptoKey = await importKeyFromBase64(context.keyFragment);

      // Encrypt the report data
      const jsonData = JSON.stringify(completeReportData);
      const { ciphertext, iv } = await encryptData(jsonData, cryptoKey);

      // Prepare for upload
      const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
      combinedData.set(iv, 0);
      combinedData.set(new Uint8Array(ciphertext), iv.length);

      // Prepare submission data
      const submitData = {
        threadId: context.threadId,
        threadTitle: context.teamName,
        data: Array.from(combinedData),
        metadata: {
          authorId,
          isReport: true,
          timestamp: new Date().toISOString(),
          status,
        },
      };

      // Include messageIndex for editing
      if (context.messageIndex !== null) {
        submitData.messageIndex = context.messageIndex;
      }

      // Send to the server
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error(
          status === "draft"
            ? "Error saving draft. Please try again."
            : "Error submitting report. Please try again."
        );
      }

      // Synchronize reference data
      // This would typically be handled through a separate service
      // In a real implementation, we would use an injected service

      return { success: true, status };
    } catch (err) {
      console.error("Error submitting report:", err);
      throw err;
    }
  };

  return {
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
    // Form submission
    handleSubmit,
    handleSaveAsDraft,
    isSubmitting,
    error,
    success,
    successMessage,
    retry,
    // State information
    state,
    send,
  };
};

export default useReportFormMachine;