/**
 * State machine for the Report Form
 * This defines all possible states and transitions for the form
 */
import { createMachine, assign } from 'xstate';

/**
 * Creates a report form state machine
 * @param {Object} context - Initial context for the state machine
 * @returns {StateMachine} - XState state machine for the report form
 */
export const createReportFormMachine = (context) => {
  return createMachine({
    id: 'reportForm',
    initial: 'idle',
    context: {
      // Form data
      teamMember: '',
      teamRole: '',
      rows: [],
      expandedRows: {},
      // Status flags
      isReadOnly: false,
      error: null,
      success: false,
      successMessage: '',
      // Properties from outside
      teamName: '',
      // Override with provided context
      ...context
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
          UPDATE_FIELD: {
            actions: 'updateField'
          },
          UPDATE_TEAM_MEMBER: {
            actions: 'updateTeamMember'
          },
          UPDATE_TEAM_ROLE: {
            actions: 'updateTeamRole'
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
          // Special field handling
          UPDATE_SDLC_STEP: {
            actions: 'updateSDLCStep'
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
            actions: 'setSuccess'
          },
          onError: {
            target: 'error',
            actions: 'setSaveError'
          }
        }
      },
      // Submitting form as final
      submitting: {
        invoke: {
          src: 'submitForm',
          onDone: {
            target: 'success',
            actions: 'setSuccess'
          },
          onError: {
            target: 'error',
            actions: 'setSubmitError'
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