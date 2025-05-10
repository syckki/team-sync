import { createMachine, assign } from 'xstate';

/**
 * Creates a new empty row with a unique ID
 * @returns {Object} A new empty productivity report row
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
  timeSaved: "", // calculated value
  complexity: "",
  qualityImpact: "",
  aiToolsUsed: [],
  taskDetails: "",
  notesHowAIHelped: "",
});

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
 * Calculate time saved based on estimated and actual time
 * @param {number|string} estimatedTime - Estimated time without AI
 * @param {number|string} actualTime - Actual time with AI
 * @returns {string} - Time saved, rounded to quarter hour
 */
const calculateTimeSaved = (estimatedTime, actualTime) => {
  const estTime = parseFloat(estimatedTime) || 0;
  const actTime = parseFloat(actualTime) || 0;
  const timeSaved = Math.max(0, estTime - actTime);
  return roundToQuarterHour(timeSaved);
};

/**
 * Creates a report form state machine
 * @returns {StateMachine} XState state machine for the report form
 */
export const createReportFormMachine = () => {
  return createMachine({
    id: 'reportForm',
    initial: 'idle',
    context: {
      // Form data
      teamName: "",
      teamMember: "",
      teamRole: "",
      rows: [getNewRow()],
      expandedRows: {},
      // Status flags
      isReadOnly: false,
      isSubmitting: false,
      error: null,
      success: false,
      successMessage: "",
    },
    states: {
      // Initial state - waiting to be initialized
      idle: {
        on: {
          INITIALIZE: {
            target: 'loading',
            actions: 'resetForm',
          }
        }
      },
      // Loading report data (existing report or creating new one)
      loading: {
        invoke: {
          src: 'loadReportData',
          onDone: {
            target: 'editing',
            actions: 'setInitialFormData'
          },
          onError: {
            target: 'error',
            actions: 'setLoadError'
          }
        }
      },
      // User is editing the form
      editing: {
        on: {
          // Form field updates
          UPDATE_TEAM_MEMBER: {
            actions: 'updateTeamMember'
          },
          UPDATE_TEAM_ROLE: {
            actions: 'updateTeamRole'
          },
          UPDATE_FIELD: {
            actions: 'updateField'
          },
          // Special field handling
          UPDATE_SDLC_STEP: {
            actions: 'updateSDLCStep'
          },
          // Row operations
          ADD_ROW: {
            actions: 'addRow'
          },
          REMOVE_ROW: {
            actions: 'removeRow'
          },
          TOGGLE_ROW: {
            actions: 'toggleRowExpansion'
          },
          // Form submission
          SAVE_DRAFT: {
            target: 'savingDraft',
            actions: 'validateForm',
            guard: 'isFormValid'
          },
          SUBMIT: {
            target: 'submitting',
            actions: 'validateForm',
            guard: 'isFormValid'
          }
        }
      },
      // Saving form as draft
      savingDraft: {
        entry: assign({ isSubmitting: true }),
        invoke: {
          src: 'saveDraft',
          onDone: {
            target: 'success',
            actions: 'setSuccessFromDraft'
          },
          onError: {
            target: 'error',
            actions: 'setSaveError'
          }
        },
        exit: assign({ isSubmitting: false })
      },
      // Submitting form as final
      submitting: {
        entry: assign({ isSubmitting: true }),
        invoke: {
          src: 'submitForm',
          onDone: {
            target: 'success',
            actions: 'setSuccessFromSubmit'
          },
          onError: {
            target: 'error',
            actions: 'setSubmitError'
          }
        },
        exit: assign({ isSubmitting: false })
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