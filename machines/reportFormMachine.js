/**
 * State machine for the Report Form
 * This defines all possible states and transitions for the form
 */
import { createMachine, assign } from 'xstate';

// Define a function to get a new row
const getNewRow = () => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  platform: '',
  projectInitiative: '',
  sdlcStep: '',
  sdlcTask: '',
  taskCategory: '',
  estimatedTimeWithoutAI: '',
  actualTimeWithAI: '',
  timeSaved: '',
  complexity: '',
  qualityImpact: '',
  aiToolsUsed: [],
  taskDetails: '',
  notesHowAIHelped: '',
});

// Calculate time saved with proper rounding
const calculateTimeSaved = (estimatedTime, actualTime) => {
  if (!estimatedTime || !actualTime) return '';
  const parsed1 = parseFloat(estimatedTime);
  const parsed2 = parseFloat(actualTime);
  if (isNaN(parsed1) || isNaN(parsed2)) return '';
  
  const timeSaved = Math.max(0, parsed1 - parsed2);
  return Number(timeSaved.toFixed(2)).toString();
};

/**
 * Creates a report form state machine
 * @param {Object} context - Initial context for the state machine
 * @returns {StateMachine} - XState state machine for the report form
 */
export const createReportFormMachine = (initialContext) => {
  return createMachine({
    id: 'reportForm',
    initial: 'idle',
    context: {
      // Form data
      teamMember: '',
      teamRole: '',
      rows: [getNewRow()],
      expandedRows: {},
      // Status flags
      isReadOnly: false,
      error: null,
      success: false,
      successMessage: '',
      // Properties from outside
      teamName: '',
      // Override with provided context
      ...initialContext
    },
    states: {
      // Initial state - waiting to be initialized
      idle: {
        on: {
          INITIALIZE: {
            target: 'loading',
            actions: assign({
              teamMember: '',
              teamRole: '',
              rows: [getNewRow()],
              expandedRows: {},
              error: null,
              success: false,
              successMessage: '',
            })
          }
        }
      },
      // Loading report data (existing report or creating new one)
      loading: {
        invoke: {
          src: 'loadReportData',
          onDone: {
            target: 'editing',
            actions: assign(({ event }) => {
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
                teamMember: data.teamMember || '',
                teamRole: data.teamRole || '',
                rows: loadedRows,
                expandedRows: {},
                isReadOnly: isSubmitted || initialContext.isReadOnly,
              };
            })
          },
          onError: {
            target: 'error',
            actions: assign({
              error: ({ event }) => event.data?.message || "Failed to load report data"
            })
          }
        }
      },
      // User is editing the form
      editing: {
        on: {
          // Form field updates
          UPDATE_FIELD: {
            actions: assign({
              rows: ({ context, event }) => context.rows.map(row => {
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
            })
          },
          UPDATE_TEAM_MEMBER: {
            actions: assign({
              teamMember: ({ event }) => event.value
            })
          },
          UPDATE_TEAM_ROLE: {
            actions: assign({
              teamRole: ({ event }) => event.value
            })
          },
          // Row operations
          ADD_ROW: {
            actions: assign(({ context }) => {
              const newRow = getNewRow();
              return {
                rows: [...context.rows, newRow],
                expandedRows: {
                  ...context.expandedRows,
                  [newRow.id]: true // Automatically expand the new row
                }
              };
            })
          },
          REMOVE_ROW: {
            actions: assign(({ context, event }) => {
              const newExpandedRows = { ...context.expandedRows };
              delete newExpandedRows[event.id];
              
              return {
                rows: context.rows.filter(row => row.id !== event.id),
                expandedRows: newExpandedRows
              };
            })
          },
          TOGGLE_ROW: {
            actions: assign({
              expandedRows: ({ context, event }) => ({
                ...context.expandedRows,
                [event.id]: !context.expandedRows[event.id]
              })
            })
          },
          // Special field handling
          UPDATE_SDLC_STEP: {
            actions: assign({
              rows: ({ context, event }) => context.rows.map(row => 
                row.id === event.id
                  ? { ...row, sdlcStep: event.value, sdlcTask: "" }
                  : row
              )
            })
          },
          // Form submission
          SAVE_DRAFT: {
            target: 'savingDraft',
          },
          SUBMIT: {
            target: 'submitting',
          }
        }
      },
      // Saving form as draft
      savingDraft: {
        invoke: {
          src: 'saveDraft',
          onDone: {
            target: 'success',
            actions: assign({
              success: true,
              successMessage: ({ event }) => event.data.message
            })
          },
          onError: {
            target: 'error',
            actions: assign({
              error: ({ event }) => event.data?.message || "Failed to save draft"
            })
          }
        }
      },
      // Submitting form as final
      submitting: {
        invoke: {
          src: 'submitForm',
          onDone: {
            target: 'success',
            actions: assign({
              success: true,
              successMessage: ({ event }) => event.data.message
            })
          },
          onError: {
            target: 'error',
            actions: assign({
              error: ({ event }) => event.data?.message || "Failed to submit report"
            })
          }
        }
      },
      // Successful operation
      success: {
        after: {
          3000: 'redirecting'
        }
      },
      // Redirecting to inbox
      redirecting: {
        entry: 'redirectToInbox',
        type: 'final'
      },
      // Error state
      error: {
        on: {
          RETRY: 'editing'
        }
      }
    }
  });
};

export default createReportFormMachine;