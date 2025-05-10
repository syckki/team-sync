import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useMachine } from '@xstate/react';
import { assign } from 'xstate';
import { createReportFormMachine } from '../../machines/reportFormMachine';
import { importKeyFromBase64, encryptData } from '../../lib/cryptoUtils';

/**
 * Round time to nearest quarter hour (0.00, 0.25, 0.50, 0.75)
 * @param {number|string} time - Time value to round
 * @returns {string} - Rounded time as string with 2 decimal places
 */
const roundToQuarterHour = (time) => {
  const value = parseFloat(time) || 0;
  return (Math.round(value * 4) / 4).toFixed(2);
};

/**
 * Get a new row with a unique ID
 * @returns {Object} A new row object with default values
 */
const getNewRow = () => ({
  id: Date.now(),
  platform: "",
  projectInitiative: "",
  sdlcStep: "",
  sdlcTask: "",
  taskCategory: "",
  estimatedTimeWithoutAI: "",
  actualTimeWithAI: "",
  timeSaved: "", // is calculated
  complexity: "",
  qualityImpact: "",
  aiToolsUsed: [],
  taskDetails: "",
  notesHowAIHelped: "",
});

/**
 * Custom hook for managing report form with XState machine
 * @param {Object} props - Hook properties
 * @param {string} props.threadId - Thread ID
 * @param {string} props.keyFragment - Encryption key fragment
 * @param {string} props.teamName - Team name
 * @param {Object} props.initialReportData - Initial report data if editing
 * @param {boolean} props.readOnly - Whether form is read-only
 * @param {number|null} props.messageIndex - Message index if editing
 * @param {Function} props.updateReferenceData - Function to update reference data
 * @returns {Object} State machine interface and form operations
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

  // Define actions for the state machine
  const actions = {
    // Reset form to initial state
    resetForm: assign({
      teamMember: "",
      teamRole: "",
      rows: [getNewRow()],
      expandedRows: {},
      isReadOnly: readOnly,
      error: null,
      success: false,
      successMessage: "",
    }),
    
    // Set initial form data from loaded report
    setInitialFormData: assign((_, event) => {
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
        teamName: data.teamName || teamName,
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

            if (!isNaN(estimatedTime) && !isNaN(actualTime)) {
              const timeSaved = Math.max(0, estimatedTime - actualTime);
              updatedRow.timeSaved = roundToQuarterHour(timeSaved);
            } else {
              updatedRow.timeSaved = "";
            }
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
      error: (_, event) => event.data?.message || "Failed to save draft",
      isSubmitting: false
    }),
    
    // Set error from submitting
    setSubmitError: assign({
      error: (_, event) => event.data?.message || "Failed to submit report",
      isSubmitting: false
    }),
    
    // Set success from draft save
    setSuccessFromDraft: assign({
      success: true,
      successMessage: "Your AI productivity report has been saved as a draft!",
      isSubmitting: false
    }),
    
    // Set success from submit
    setSuccessFromSubmit: assign({
      success: true,
      successMessage: "Your AI productivity report has been submitted successfully!",
      isSubmitting: false
    }),
    
    // Form validation action
    validateForm: (context) => {
      try {
        prepareFormData(context);
        return true;
      } catch (error) {
        console.error("Validation error:", error);
        return false;
      }
    },
    
    // Redirect to inbox
    redirectToInbox: () => {
      router.push(`/channel/${threadId}#${keyFragment}`);
    }
  };

  // Define guards for the state machine
  const guards = {
    // Check if the form is valid before submission
    isFormValid: (context) => {
      try {
        prepareFormData(context);
        return true;
      } catch (error) {
        console.error("Validation failed:", error);
        return false;
      }
    }
  };

  // Prepare form data for submission (validation and formatting)
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

  // Define services for the state machine
  const services = {
    // Load report data
    loadReportData: async () => {
      console.log('Loading report data...');
      // For now, just return the initialReportData or create new data
      return initialReportData || {
        teamMember: "",
        teamRole: "",
        entries: [],
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

  // Create and initialize the machine
  const [state, send] = useMachine(
    createReportFormMachine(),
    {
      actions,
      services,
      guards,
      context: {
        teamName
      }
    }
  );

  // Initialize the machine (memoized to avoid recreating on renders)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialize = useCallback(() => {
    send({ type: 'INITIALIZE' });
  }, []);

  return {
    // Machine state
    state,
    context: state.context,
    
    // Form state
    teamMember: state.context.teamMember,
    teamRole: state.context.teamRole,
    rows: state.context.rows,
    expandedRows: state.context.expandedRows,
    isReadOnly: state.context.isReadOnly,
    
    // Status flags
    isSubmitting: state.context.isSubmitting,
    error: state.context.error,
    success: state.context.success,
    successMessage: state.context.successMessage,
    
    // Initialization
    initialize,
    
    // Event handlers
    setTeamMember: (value) => send({ type: 'UPDATE_TEAM_MEMBER', value }),
    setTeamRole: (value) => send({ type: 'UPDATE_TEAM_ROLE', value }),
    handleRowChange: (id, field, value) => send({ type: 'UPDATE_FIELD', id, field, value }),
    handleSDLCStepChange: (id, value) => send({ type: 'UPDATE_SDLC_STEP', id, value }),
    toggleRowExpansion: (id) => send({ type: 'TOGGLE_ROW', id }),
    addRow: () => send({ type: 'ADD_ROW' }),
    removeRow: (id) => send({ type: 'REMOVE_ROW', id }),
    
    // Form submission
    saveAsDraft: () => send({ type: 'SAVE_DRAFT' }),
    submitForm: () => send({ type: 'SUBMIT' }),
    retry: () => send({ type: 'RETRY' }),
    
    // Utility methods
    prepareFormData: () => prepareFormData(state.context),
  };
};

export default useReportFormMachine;