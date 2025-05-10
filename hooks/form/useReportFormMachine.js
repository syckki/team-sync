import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useActor } from '@xstate/react';
import { createActor } from 'xstate';
import { createReportFormMachine } from '../../machines/reportFormMachine';
import { importKeyFromBase64, encryptData } from '../../lib/cryptoUtils';

/**
 * Round time to the nearest quarter hour (0.00, 0.25, 0.50, 0.75)
 * @param {number|string} time - Time value to round
 * @returns {string} - Rounded time as string with 2 decimal places
 */
const roundToQuarterHour = (time) => {
  const value = parseFloat(time) || 0;
  return (Math.round(value * 4) / 4).toFixed(2);
};

/**
 * Custom hook that combines the report form state machine with business logic
 * @param {Object} props - Props for the hook
 * @param {string} props.threadId - The thread ID for the report
 * @param {string} props.keyFragment - The key fragment for encryption
 * @param {string} props.teamName - The team name for the report
 * @param {Object} props.initialReportData - Initial report data (if any)
 * @param {boolean} props.readOnly - Whether the form is read-only
 * @param {number|null} props.messageIndex - Message index for editing existing reports
 * @param {Function} props.updateReferenceData - Function to update reference data
 * @returns {Object} - State machine interface and form operations
 */
const useReportFormMachine = ({
  threadId,
  keyFragment,
  teamName,
  initialReportData = null,
  readOnly = false,
  messageIndex = null,
  updateReferenceData,
}) => {
  const router = useRouter();

  // Create a new row with a unique ID
  const getNewRow = useCallback(() => ({
    id: Date.now(),
    platform: "",
    projectInitiative: "",
    sdlcStep: "",
    sdlcTask: "",
    taskCategory: "",
    estimatedTimeWithoutAI: "",
    actualTimeWithAI: "",
    timeSaved: "", // calculated value
    complexity: "",
    qualityImpact: "",
    aiToolsUsed: [],
    taskDetails: "",
    notesHowAIHelped: "",
  }), []);

  // Calculate time saved based on estimated and actual time
  const calculateTimeSaved = (estimatedTime, actualTime) => {
    if (isNaN(estimatedTime) || isNaN(actualTime)) {
      return "";
    }
    const timeSaved = Math.max(0, estimatedTime - actualTime);
    return roundToQuarterHour(timeSaved);
  };

  // Submit report data to the server
  const submitReportData = async (context, status) => {
    try {
      // Prepare the form data
      const formData = prepareFormData(context);

      // Get author ID for multi-user identification
      const authorId = localStorage.getItem("encrypted-app-author-id");

      // Add system fields to the form data to create the full report object
      const completeReportData = {
        ...formData,
        timestamp: new Date().toISOString(),
        status, // 'draft' or 'submitted'
        authorId,
      };

      // Import the key to use for encryption
      const cryptoKey = await importKeyFromBase64(keyFragment);

      // Encrypt the report data
      const jsonData = JSON.stringify(completeReportData);
      const { ciphertext, iv } = await encryptData(jsonData, cryptoKey);

      // Convert the combined ciphertext and IV to ArrayBuffer for upload
      const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
      combinedData.set(iv, 0);
      combinedData.set(new Uint8Array(ciphertext), iv.length);

      // Prepare the report submission
      const submitData = {
        threadId,
        threadTitle: teamName,
        data: Array.from(combinedData), // Convert the ArrayBuffer to array of bytes
        metadata: {
          authorId,
          isReport: true,
          timestamp: new Date().toISOString(),
          status, // Add status to metadata
        },
      };

      // If we're editing an existing message, include the messageIndex
      if (messageIndex !== null) {
        submitData.messageIndex = messageIndex;
      }

      // Launch two microtasks in parallel
      const microtask1 = fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      // Synchronize reference data from localStorage to the backend
      const microtask2 = updateReferenceData();

      // Wait for both operations to complete
      const [response] = await Promise.all([microtask1, microtask2]);

      if (!response.ok) {
        throw new Error(
          status === "draft"
            ? "Error saving draft. Please try again."
            : "Error submitting report. Please try again."
        );
      }

      return {
        success: true,
        message: status === "draft"
          ? "Your AI productivity report has been saved as a draft!"
          : "Your AI productivity report has been submitted successfully!"
      };
    } catch (err) {
      console.error("Error submitting report:", err);
      throw new Error(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  // Prepare form data for submission
  const prepareFormData = (context) => {
    const { teamMember, teamRole, rows } = context;

    // Basic validation
    if (!teamMember.trim()) {
      throw new Error("Please enter your name");
    }

    if (!teamRole.trim()) {
      throw new Error("Please enter your role");
    }

    if (rows.length === 0) {
      throw new Error("Please add at least one entry");
    }

    // Process the form data
    const reportEntries = rows.map((row) => ({
      platform: row.platform,
      projectInitiative: row.projectInitiative,
      sdlcStep: row.sdlcStep,
      sdlcTask: row.sdlcTask,
      taskCategory: row.taskCategory,
      estimatedTimeWithoutAI: roundToQuarterHour(row.estimatedTimeWithoutAI),
      actualTimeWithAI: roundToQuarterHour(row.actualTimeWithAI),
      timeSaved: row.timeSaved,
      complexity: row.complexity,
      qualityImpact: row.qualityImpact,
      aiToolsUsed:
        Array.isArray(row.aiToolsUsed) && row.aiToolsUsed.length > 0
          ? row.aiToolsUsed.join(", ")
          : "",
      taskDetails: row.taskDetails,
      notesHowAIHelped: row.notesHowAIHelped,
    }));

    // Create the report object
    return {
      teamName,
      teamMember,
      teamRole,
      entries: reportEntries,
    };
  };

  // Create the machine with all the implementations
  const reportFormMachine = createReportFormMachine();
  
  // Create the actor (replaces useInterpret in v5)
  const reportFormActor = createActor(reportFormMachine, {
    // Setup the initial context (overriding the defaults)
    input: {
      // Initial values
      teamName,
      initialReportData,
      // Methods
      getNewRow,
      submitReport: submitReportData,
      calculateTimeSaved,
      prepareFormData,
      updateReferenceData,
      // Navigation
      redirectToChannel: () => router.push(`/channel/${threadId}#${keyFragment}`),
    },
    // Implement the actions from the machine
    actions: {
      resetForm: ({ context }) => {
        context.teamMember = '';
        context.teamRole = '';
        context.rows = [getNewRow()];
        context.expandedRows = {};
        context.isReadOnly = readOnly;
        context.error = null;
        context.success = false;
        context.successMessage = '';
      },
      setInitialFormData: ({ context, event }) => {
        const data = event.output;
        const isSubmitted = data.status === "submitted";
        
        // Map entries to rows with proper format
        const loadedRows = data.entries && data.entries.length > 0
          ? data.entries.map((entry) => ({
              id: Date.now() + Math.floor(Math.random() * 1000), // Generate unique id
              platform: entry.platform || '',
              projectInitiative: entry.projectInitiative || '',
              sdlcStep: entry.sdlcStep || '',
              sdlcTask: entry.sdlcTask || '',
              taskCategory: entry.taskCategory || '',
              estimatedTimeWithoutAI: entry.estimatedTimeWithoutAI || '',
              actualTimeWithAI: entry.actualTimeWithAI || '',
              timeSaved: entry.timeSaved || '',
              complexity: entry.complexity || '',
              qualityImpact: entry.qualityImpact || '',
              aiToolsUsed:
                entry.aiToolsUsed
                  ? Array.isArray(entry.aiToolsUsed)
                    ? entry.aiToolsUsed
                    : entry.aiToolsUsed.includes(",")
                      ? entry.aiToolsUsed.split(",").map((t) => t.trim())
                      : [entry.aiToolsUsed]
                  : [],
              taskDetails: entry.taskDetails || '',
              notesHowAIHelped: entry.notesHowAIHelped || '',
            }))
          : [getNewRow()];

        context.teamMember = data.teamMember || '';
        context.teamRole = data.teamRole || '';
        context.rows = loadedRows;
        context.expandedRows = {};
        context.isReadOnly = isSubmitted || readOnly;
      },
      updateField: ({ context, event }) => {
        if (event.type === 'UPDATE_FIELD') {
          context.rows = context.rows.map(row => {
            if (row.id === event.id) {
              const updatedRow = { ...row, [event.field]: event.value };

              // Calculate time saved if necessary
              if (event.field === 'estimatedTimeWithoutAI' || event.field === 'actualTimeWithAI') {
                const estimatedTime = parseFloat(
                  event.field === 'estimatedTimeWithoutAI'
                    ? event.value
                    : updatedRow.estimatedTimeWithoutAI
                );
                const actualTime = parseFloat(
                  event.field === 'actualTimeWithAI'
                    ? event.value
                    : updatedRow.actualTimeWithAI
                );

                updatedRow.timeSaved = calculateTimeSaved(estimatedTime, actualTime);
              }

              return updatedRow;
            }
            return row;
          });
        }
      },
      updateSDLCStep: ({ context, event }) => {
        if (event.type === 'UPDATE_SDLC_STEP') {
          context.rows = context.rows.map(row => 
            row.id === event.id
              ? { ...row, sdlcStep: event.value, sdlcTask: "" }
              : row
          );
        }
      },
      addRow: ({ context }) => {
        const newRow = getNewRow();
        context.rows = [...context.rows, newRow];
        context.expandedRows = {
          ...context.expandedRows,
          [newRow.id]: true // Automatically expand the new row
        };
      },
      removeRow: ({ context, event }) => {
        if (event.type === 'REMOVE_ROW') {
          const newExpandedRows = { ...context.expandedRows };
          delete newExpandedRows[event.id];
          
          context.rows = context.rows.filter(row => row.id !== event.id);
          context.expandedRows = newExpandedRows;
        }
      },
      toggleRowExpansion: ({ context, event }) => {
        if (event.type === 'TOGGLE_ROW') {
          context.expandedRows = {
            ...context.expandedRows,
            [event.id]: !context.expandedRows[event.id]
          };
        }
      },
      setLoadError: ({ context, event }) => {
        context.error = event.error?.message || "Failed to load report data";
      },
      setSaveError: ({ context, event }) => {
        context.error = event.error?.message || "Failed to save draft";
      },
      setSubmitError: ({ context, event }) => {
        context.error = event.error?.message || "Failed to submit report";
      },
      setSuccess: ({ context, event }) => {
        context.success = true;
        context.successMessage = event.output.message;
      },
      redirectToInbox: ({ input }) => {
        input.redirectToChannel();
      }
    },
    // Implement the guards from the machine
    guards: {
      isFormValid: ({ context }) => {
        try {
          prepareFormData(context);
          return true;
        } catch (e) {
          return false;
        }
      }
    },
  });

  // Start the actor (required in v5)
  useEffect(() => {
    reportFormActor.start();
    reportFormActor.send({ type: 'INITIALIZE' });
    
    // Cleanup on unmount
    return () => {
      reportFormActor.stop();
    };
  }, [reportFormActor]);

  // Use the actor with XState v5 hook
  const [state, send] = useActor(reportFormActor);
  
  // For debugging
  console.log('State from useActor:', state);
  
  // Alias context for convenience with fallback for safety
  const context = state?.context || {
    teamMember: '',
    teamRole: '',
    rows: [],
    expandedRows: {},
    isReadOnly: false,
    error: null,
    success: false,
    successMessage: '',
    teamName: ''
  };

  // Safe value check with fallback
  const currentState = state?.value || 'idle';
  
  // Check current state
  // In XState v5, we check state by comparing state.value directly
  const isSubmitting = currentState === 'submitting' || currentState === 'savingDraft';
  const isSuccess = currentState === 'success';
  const isError = currentState === 'error';

  return {
    // Expose state machine API
    state: state.value,
    context,
    send,
    // Form state
    teamMember: context.teamMember,
    teamRole: context.teamRole,
    rows: context.rows,
    expandedRows: context.expandedRows,
    isReadOnly: context.isReadOnly,
    // Status indicators
    isSubmitting,
    isSuccess,
    isError,
    error: context.error,
    success: context.success,
    successMessage: context.successMessage,
    // Action creators (convenience methods for components)
    updateTeamMember: (value) => send({ type: 'UPDATE_TEAM_MEMBER', value }),
    updateTeamRole: (value) => send({ type: 'UPDATE_TEAM_ROLE', value }),
    updateField: (id, field, value) => send({ type: 'UPDATE_FIELD', id, field, value }),
    updateSDLCStep: (id, value) => send({ type: 'UPDATE_SDLC_STEP', id, value }),
    toggleRowExpansion: (id) => send({ type: 'TOGGLE_ROW', id }),
    addRow: () => send({ type: 'ADD_ROW' }),
    removeRow: (id) => send({ type: 'REMOVE_ROW', id }),
    saveAsDraft: () => send({ type: 'SAVE_DRAFT' }),
    submitForm: () => send({ type: 'SUBMIT' }),
    retry: () => send({ type: 'RETRY' })
  };
};

export default useReportFormMachine;