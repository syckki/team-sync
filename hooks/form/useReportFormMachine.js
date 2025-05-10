import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMachine } from '@xstate/react';
import { createReportFormMachine } from '../../machines/reportFormMachine';
import { importKeyFromBase64, encryptData } from '../../lib/cryptoUtils';
import { assign } from 'xstate';

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

  // Services (async operations used by the state machine)
  const services = {
    // Load report data from API or props
    loadReportData: async () => {
      console.log('Loading report data...');
      // For testing purposes, add a small delay to simulate async loading
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // For now, just return the initialReportData or create new data
      return initialReportData || {
        teamMember: "",
        teamRole: "",
        entries: [getNewRow()],
        status: "draft",
      };
    },
    // Save report as draft
    saveDraft: async (context) => {
      return await submitReportData(context, "draft");
    },
    // Submit report as final
    submitForm: async (context) => {
      return await submitReportData(context, "submitted");
    },
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

  // Calculate time saved based on estimated and actual time
  const calculateTimeSaved = (estimatedTime, actualTime) => {
    if (isNaN(estimatedTime) || isNaN(actualTime)) {
      return "";
    }
    const timeSaved = Math.max(0, estimatedTime - actualTime);
    return roundToQuarterHour(timeSaved);
  };

  // Actions (synchronous operations that update context)
  const actions = {
    // Reset form to initial state
    resetForm: assign({
      teamMember: "",
      teamRole: "",
      rows: (context) => [getNewRow()],
      expandedRows: {},
      isReadOnly: readOnly,
      error: null,
      success: false,
      successMessage: "",
    }),
    // Set initial form data from loaded report
    setInitialFormData: assign((context, event) => {
      const data = event.data;
      const isSubmitted = data.status === "submitted";
      
      // Map entries to rows with proper format
      const loadedRows = data.entries && data.entries.length > 0
        ? data.entries.map((entry) => ({
            id: Date.now() + Math.floor(Math.random() * 1000), // Generate unique id
            platform: entry.platform,
            projectInitiative: entry.projectInitiative,
            sdlcStep: entry.sdlcStep,
            sdlcTask: entry.sdlcTask,
            taskCategory: entry.taskCategory,
            estimatedTimeWithoutAI: entry.estimatedTimeWithoutAI,
            actualTimeWithAI: entry.actualTimeWithAI,
            timeSaved: entry.timeSaved,
            complexity: entry.complexity,
            qualityImpact: entry.qualityImpact,
            aiToolsUsed:
              entry.aiToolsUsed
                ? Array.isArray(entry.aiToolsUsed)
                  ? entry.aiToolsUsed
                  : entry.aiToolsUsed.includes(",")
                    ? entry.aiToolsUsed.split(",").map((t) => t.trim())
                    : [entry.aiToolsUsed]
                : [],
            taskDetails: entry.taskDetails,
            notesHowAIHelped: entry.notesHowAIHelped,
          }))
        : [getNewRow()];

      return {
        teamMember: data.teamMember || "",
        teamRole: data.teamRole || "",
        rows: loadedRows,
        expandedRows: {},
        isReadOnly: isSubmitted || readOnly,
      };
    }),
    // Update team member name
    updateTeamMember: assign({
      teamMember: (_, event) => event.value
    }),
    // Update team role
    updateTeamRole: assign({
      teamRole: (_, event) => event.value
    }),
    // Update a field in a row
    updateField: assign({
      rows: (context, event) => context.rows.map(row => {
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
      })
    }),
    // Update SDLC step (resets the task)
    updateSDLCStep: assign({
      rows: (context, event) => context.rows.map(row => 
        row.id === event.id
          ? { ...row, sdlcStep: event.value, sdlcTask: "" }
          : row
      )
    }),
    // Add a new row
    addRow: assign((context) => {
      const newRow = getNewRow();
      return {
        rows: [...context.rows, newRow],
        expandedRows: {
          ...context.expandedRows,
          [newRow.id]: true // Automatically expand the new row
        }
      };
    }),
    // Remove a row
    removeRow: assign((context, event) => {
      const newExpandedRows = { ...context.expandedRows };
      delete newExpandedRows[event.id];
      
      return {
        rows: context.rows.filter(row => row.id !== event.id),
        expandedRows: newExpandedRows
      };
    }),
    // Toggle row expansion
    toggleRowExpansion: assign({
      expandedRows: (context, event) => ({
        ...context.expandedRows,
        [event.id]: !context.expandedRows[event.id]
      })
    }),
    // Set error from loading
    setLoadError: assign({
      error: (_, event) => event.data?.message || "Failed to load report data"
    }),
    // Set error from saving draft
    setSaveError: assign({
      error: (_, event) => event.data?.message || "Failed to save draft"
    }),
    // Set error from submitting
    setSubmitError: assign({
      error: (_, event) => event.data?.message || "Failed to submit report"
    }),
    // Set success state
    setSuccess: assign((_, event) => ({
      success: true,
      successMessage: event.data.message
    })),
    // Redirect to inbox
    redirectToInbox: () => {
      router.push(`/channel/${threadId}#${keyFragment}`);
    }
  };

  // Create the machine with stable reference using useRef
  const reportFormMachine = useRef(
    createReportFormMachine({
      teamName,
      isReadOnly: readOnly
    })
  ).current;

  // Use the machine with provide() pattern for XState v5
  const [state, send] = useMachine(
    reportFormMachine.provide({
      actions,
      services
    })
  );

  // Initialize the machine when the component mounts
  useEffect(() => {
    send({ type: 'INITIALIZE' });
  }, [send]);

  // Get commonly used state values
  const context = state.context;
  const isSubmitting = state.matches('submitting') || state.matches('savingDraft');
  const isSuccess = state.matches('success');
  const isError = state.matches('error');

  return {
    // Basic state machine access
    state,
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
    // Action creators (makes it easier for components to send events)
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