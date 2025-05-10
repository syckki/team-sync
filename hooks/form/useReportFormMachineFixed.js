import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useMachine } from '@xstate/react';
import { assign, createMachine } from 'xstate';

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
 * This is a simplified version of the state machine to demonstrate and test XState
 */ 
const useReportFormMachineFixed = ({
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
  
  // Create the machine inline to avoid re-creation
  const reportFormMachine = useRef(createMachine({
    id: 'reportForm',
    initial: 'idle',
    context: {
      // Form data
      teamMember: '',
      teamRole: '',
      rows: [],
      expandedRows: {},
      // Status flags
      isReadOnly: readOnly,
      error: null,
      success: false,
      successMessage: '',
      // Properties from outside
      teamName: teamName || '',
    },
    states: {
      // Initial state - waiting to be initialized
      idle: {
        on: {
          INITIALIZE: {
            target: 'loading',
            actions: assign({
              teamMember: "",
              teamRole: "",
              rows: () => [getNewRow()],
              expandedRows: {},
              isReadOnly: readOnly,
              error: null,
              success: false,
              successMessage: "",
            }),
          }
        }
      },
      // Loading report data (existing report or creating new one)
      loading: {
        always: {
          target: 'editing'
        }
      },
      // User is editing the form
      editing: {
        on: {
          // Form field updates
          UPDATE_FIELD: {
            actions: assign({
              rows: (context, event) => context.rows.map(row => {
                if (row.id === event.id) {
                  return { ...row, [event.field]: event.value };
                }
                return row;
              })
            })
          },
          UPDATE_TEAM_MEMBER: {
            actions: assign({
              teamMember: (_, event) => event.value
            })
          },
          UPDATE_TEAM_ROLE: {
            actions: assign({
              teamRole: (_, event) => event.value
            })
          },
          // Row operations
          ADD_ROW: {
            actions: assign((context) => {
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
            actions: assign((context, event) => {
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
              expandedRows: (context, event) => ({
                ...context.expandedRows,
                [event.id]: !context.expandedRows[event.id]
              })
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
      // Saving form as draft (simplified for demo)
      savingDraft: {
        after: {
          1000: {
            target: 'success', 
            actions: assign({
              success: true,
              successMessage: "Your AI productivity report has been saved as a draft!"
            })
          }
        }
      },
      // Submitting form as final (simplified for demo)
      submitting: {
        after: {
          1000: {
            target: 'success',
            actions: assign({
              success: true,
              successMessage: "Your AI productivity report has been submitted successfully!"
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
      // Redirecting to inbox (simplified for demo)
      redirecting: {
        type: 'final',
        entry: () => {
          console.log('Redirecting to inbox...');
          // For demo, don't actually redirect
        }
      },
      // Error state
      error: {
        on: {
          RETRY: 'editing'
        }
      }
    }
  })).current;

  // Use the machine
  const [state, send] = useMachine(reportFormMachine);
  
  // Initialize the machine when the component mounts
  useEffect(() => {
    send({ type: 'INITIALIZE' });
  }, [send]);

  return {
    // Basic state machine access
    state,
    context: state.context,
    send,
    // Form state
    teamMember: state.context.teamMember,
    teamRole: state.context.teamRole,
    rows: state.context.rows,
    expandedRows: state.context.expandedRows,
    isReadOnly: state.context.isReadOnly,
    // Status indicators
    isSubmitting: state.matches('submitting') || state.matches('savingDraft'),
    isSuccess: state.matches('success'),
    isError: state.matches('error'),
    error: state.context.error,
    success: state.context.success,
    successMessage: state.context.successMessage,
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

export default useReportFormMachineFixed;