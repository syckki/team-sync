import { createMachine, assign } from "xstate";

// Helper functions
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

// Round time to the nearest quarter hour (0.00, 0.25, 0.50, 0.75)
const roundToQuarterHour = (time) => {
  const value = parseFloat(time) || 0;
  return (Math.round(value * 4) / 4).toFixed(2);
};

/**
 * XState machine for the Report Form
 * This defines all possible states and transitions for the form
 */
export const createReportFormMachine = ({
  teamName = "",
  readOnly = false,
  initialReportData = null,
  threadId = "",
  keyFragment = "",
  messageIndex = null,
  router,
  referenceDataService,
}) => {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QAUCGtYHcD2AnMAwiALIAOAFgJAB2A9rOahgDaokGp0DWJDNRmOAMIAogCkA0gBkAwgEEA8gHEAogFkAygAkAwr21CA2gAYAuolAZ2XALQBWUnIEBfN0bTYcBIiQoS3mHjikAA6kCJCQyGyQZJw8AokAtLwixEoq-J5eQbREogA2RKZmllY2dnEOzm4eSQVFJRAE-BQUZTlKkKWm2eZ46JCo7CVl-SaG8nJyVTX1TWYt7Z3dqD1RMQiYuBg+uFBQhNgwKPj4pJTZOXkFKgJyLvbqqlaZohlZ2dJGkICqzHDrEoXYYHGZgOZgWaLFbrTYIXb7ACmXE4WwOJxqXGe0LQHy+XzmnxQLmWEjObksUl+cjiDj+yCcMLSSLkaP8Gmm-kCQJBYMhW3hsI2SLgclwp0JOOJxPJ6MplOudIZTLQzN+7MBliUdjkviF6wcIqc2BQKBVUw1UHlSHVJ1IG2o9C1Oz1BtgJviRCiVTc6T+1pByABbmBKFQ7qdTq8WOLvndFU9lb8Ax8DNafsMvLdbUj0n8pTZPnGQSLnkpE-6XaKky7-l7TS78xb827Ib9vbB0Z6i9rfYWYWgUOdEU5-Qjjq85FcZO8Yy9XLlfGr-v9ARXAZXgSDDeLDpLywF6xdZJcLl5WYi3MKm0j26n1xnwKj3qzTZ9m32PY3BWIt+D4CAfn9AEJFaUVBFDZ5XlbM5O1vO4NVWelgIqWCA3NGM7Stb0x1GJCEGnGCl0wXttz7GMpyfV83wXa9aLBIjGSTM4SDVR8KDFJstQTVBnwZFiWKDZUOJLLiuzlZMbxXUE71IOQpBkNBz3qO1GUYwjmNrDwmyILtgN7NcnzxQNcMjIloxAqNQOjeEDKM9F-X0kkSWQaYwKiKDVKiPSMn-btBxHDj6Os8y9X3BlMKBNcYJhYAUxORxvgE75Vn+dZfgUUEGrFP8pSg3BuP7D47ItfyuJEwDV3k1iCGXRjrLXED13NfcZL1U9LwavLHyfAd+qYqNTla9jWNa9FuoAA */
      id: "reportForm",
      context: {
        // Form state
        teamName,
        teamMember: "",
        teamRole: "",
        isReadOnly: readOnly,
        rows: [getNewRow()],
        expandedRows: {},
        // Submission state
        isSubmitting: false,
        error: null,
        success: false,
        successMessage: "",
        // External data
        messageIndex,
        keyFragment,
        threadId,
        router,
      },
      initial: "idle",
      states: {
        idle: {
          always: [
            {
              target: "loading",
              cond: (ctx) => Boolean(ctx.messageIndex !== null || initialReportData),
            },
          ],
          on: {
            INITIALIZE: {
              target: "loading",
            },
          },
        },
        loading: {
          invoke: {
            src: "loadInitialData",
            onDone: {
              target: "editing",
              actions: "setInitialFormData",
            },
            onError: {
              target: "error",
              actions: "setLoadError",
            },
          },
        },
        editing: {
          on: {
            SAVE_DRAFT: {
              target: "savingDraft",
              actions: "validateForm",
              cond: "isFormValid",
            },
            SUBMIT: {
              target: "submitting",
              actions: "validateForm",
              cond: "isFormValid",
            },
            ADD_ROW: {
              actions: "addRow",
            },
            REMOVE_ROW: {
              actions: "removeRow",
            },
            UPDATE_TEAM_MEMBER: {
              actions: "updateTeamMember",
            },
            UPDATE_TEAM_ROLE: {
              actions: "updateTeamRole",
            },
            UPDATE_ROW_FIELD: {
              actions: "updateRowField",
            },
            UPDATE_SDLC_STEP: {
              actions: "updateSdlcStep",
            },
            TOGGLE_ROW: {
              actions: "toggleRowExpansion",
            },
          },
        },
        savingDraft: {
          invoke: {
            src: "saveDraft",
            onDone: {
              target: "success",
              actions: "setSuccess",
            },
            onError: {
              target: "error",
              actions: "setSaveError",
            },
          },
        },
        submitting: {
          invoke: {
            src: "submitFinal",
            onDone: {
              target: "success",
              actions: "setSuccess",
            },
            onError: {
              target: "error",
              actions: "setSubmitError",
            },
          },
        },
        success: {
          after: {
            3000: "redirecting",
          },
        },
        redirecting: {
          entry: "redirectToChannelInbox",
          type: "final",
        },
        error: {
          on: {
            RETRY: "editing",
          },
        },
      },
    },
    {
      actions: {
        // Form state actions
        setInitialFormData: assign((ctx, event) => {
          const reportData = event.data;
          
          // Process loaded report data
          const updatedContext = { 
            ...ctx,
            teamMember: reportData.teamMember || "",
            teamRole: reportData.teamRole || "",
          };
          
          // Set read-only mode if submitted
          if (reportData.status === "submitted") {
            updatedContext.isReadOnly = true;
          }
          
          // Set rows data if available
          if (reportData.entries && reportData.entries.length > 0) {
            // Transform entries to row format with unique IDs
            updatedContext.rows = reportData.entries.map(entry => ({
              id: Date.now() + Math.floor(Math.random() * 1000),
              platform: entry.platform || "",
              projectInitiative: entry.projectInitiative || "",
              sdlcStep: entry.sdlcStep || "",
              sdlcTask: entry.sdlcTask || "",
              taskCategory: entry.taskCategory || "",
              estimatedTimeWithoutAI: entry.estimatedTimeWithoutAI || "",
              actualTimeWithAI: entry.actualTimeWithAI || "",
              timeSaved: entry.timeSaved || "",
              complexity: entry.complexity || "",
              qualityImpact: entry.qualityImpact || "",
              aiToolsUsed: entry.aiToolsUsed
                ? Array.isArray(entry.aiToolsUsed)
                  ? entry.aiToolsUsed
                  : entry.aiToolsUsed.includes(",")
                    ? entry.aiToolsUsed.split(",").map(t => t.trim())
                    : [entry.aiToolsUsed]
                : [],
              taskDetails: entry.taskDetails || "",
              notesHowAIHelped: entry.notesHowAIHelped || "",
            }));
          }
          
          return updatedContext;
        }),
        
        updateTeamMember: assign({
          teamMember: (_, event) => event.value,
        }),
        
        updateTeamRole: assign({
          teamRole: (_, event) => event.value,
        }),
        
        updateSdlcStep: assign({
          rows: (ctx, event) => ctx.rows.map(row => 
            row.id === event.id 
              ? { ...row, sdlcStep: event.value, sdlcTask: "" } 
              : row
          ),
        }),
        
        updateRowField: assign({
          rows: (ctx, event) => {
            return ctx.rows.map(row => {
              if (row.id === event.id) {
                const updatedRow = { ...row, [event.field]: event.value };
                
                // Calculate time saved if relevant fields updated
                if (event.field === "estimatedTimeWithoutAI" || event.field === "actualTimeWithAI") {
                  const estimatedTime = parseFloat(
                    event.field === "estimatedTimeWithoutAI" 
                      ? event.value 
                      : updatedRow.estimatedTimeWithoutAI
                  );
                  const actualTime = parseFloat(
                    event.field === "actualTimeWithAI" 
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
            });
          },
        }),
        
        addRow: assign({
          rows: (ctx) => [...ctx.rows, getNewRow()],
          expandedRows: (ctx) => {
            const newRowId = Date.now();
            return { ...ctx.expandedRows, [newRowId]: true };
          },
        }),
        
        removeRow: assign({
          rows: (ctx, event) => ctx.rows.filter(row => row.id !== event.id),
          expandedRows: (ctx, event) => {
            const newExpandedRows = { ...ctx.expandedRows };
            delete newExpandedRows[event.id];
            return newExpandedRows;
          },
        }),
        
        toggleRowExpansion: assign({
          expandedRows: (ctx, event) => ({
            ...ctx.expandedRows,
            [event.id]: !ctx.expandedRows[event.id],
          }),
        }),
        
        // Submission actions
        setSuccess: assign((ctx, event) => {
          const status = event.data.status;
          return {
            success: true,
            error: null,
            successMessage: status === "draft"
              ? "Your AI productivity report has been saved as a draft!"
              : "Your AI productivity report has been submitted successfully!",
          };
        }),
        
        setLoadError: assign({
          error: (_, event) => event.data?.message || "Failed to load report data.",
        }),
        
        setSaveError: assign({
          error: (_, event) => event.data?.message || "Failed to save draft report.",
          isSubmitting: false,
        }),
        
        setSubmitError: assign({
          error: (_, event) => event.data?.message || "Failed to submit report.",
          isSubmitting: false,
        }),
        
        redirectToChannelInbox: (ctx) => {
          if (ctx.router && ctx.threadId && ctx.keyFragment) {
            ctx.router.push(`/channel/${ctx.threadId}#${ctx.keyFragment}`);
          }
        },
      },
      
      guards: {
        isFormValid: (ctx) => {
          // Basic form validation
          if (!ctx.teamMember.trim()) {
            return false;
          }
          
          if (!ctx.teamRole.trim()) {
            return false;
          }
          
          if (ctx.rows.length === 0) {
            return false;
          }
          
          return true;
        },
      },
      
      services: {
        loadInitialData: async (ctx) => {
          // If we already have the report data, just return it
          if (initialReportData) {
            return initialReportData;
          }
          
          // Otherwise load from the API if we have messageIndex
          if (ctx.messageIndex !== null && ctx.threadId && ctx.keyFragment) {
            // This would be the API call to fetch the specific message
            // For now we'll just return an empty object as a placeholder
            return {}; // This would be replaced with actual API call
          }
          
          // Default empty report
          return {
            teamMember: "",
            teamRole: "",
            entries: [],
          };
        },
        
        saveDraft: async (ctx) => {
          // Prepare form data
          const formData = prepareFormData(ctx);
          
          // Submit the report as draft
          return await submitReport(
            formData, 
            "draft", 
            ctx.teamName,
            ctx.threadId,
            ctx.keyFragment,
            ctx.messageIndex
          );
        },
        
        submitFinal: async (ctx) => {
          // Prepare form data
          const formData = prepareFormData(ctx);
          
          // Submit the report as final
          return await submitReport(
            formData, 
            "submitted", 
            ctx.teamName,
            ctx.threadId,
            ctx.keyFragment,
            ctx.messageIndex
          );
        },
      },
    }
  );
};

// Helper function to prepare form data
const prepareFormData = (context) => {
  const { teamName, teamMember, teamRole, rows } = context;
  
  // Process the form data
  const reportEntries = rows.map(row => ({
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
    aiToolsUsed: Array.isArray(row.aiToolsUsed) && row.aiToolsUsed.length > 0
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

// This function would be imported from useReportSubmission
// Included here for completeness
const submitReport = async (formData, status, teamName, threadId, keyFragment, messageIndex) => {
  // Get author ID for multi-user identification
  const authorId = localStorage.getItem("encrypted-app-author-id");
  
  // Add system fields to the form data
  const completeReportData = {
    ...formData,
    timestamp: new Date().toISOString(),
    status, // 'draft' or 'submitted'
    authorId,
  };
  
  // The actual encryption and submission would happen here
  // This would be imported from the useReportSubmission hook
  
  return {
    success: true,
    status,
  };
};