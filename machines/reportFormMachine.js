/**
 * State machine for the Report Form
 * This defines all possible states and transitions for the form
 * Using XState v5 syntax, but without TypeScript
 */
import { setup } from 'xstate';

/**
 * Creates a report form state machine with XState v5 syntax
 * @returns {Object} - XState state machine for the report form
 */
export const createReportFormMachine = () => {
  // Define the machine
  const machine = setup({
    actions: {
      // Empty implementations - will be provided by the hook
      resetForm: () => {},
      setInitialFormData: () => {},
      updateTeamMember: ({ context, event }) => {
        context.teamMember = event.value;
      },
      updateTeamRole: ({ context, event }) => {
        context.teamRole = event.value;
      },
      updateField: () => {},
      updateSDLCStep: () => {},
      addRow: () => {},
      removeRow: () => {},
      toggleRowExpansion: () => {},
      setLoadError: () => {},
      setSaveError: () => {},
      setSubmitError: () => {},
      setSuccess: () => {},
      redirectToInbox: () => {}
    },
    guards: {
      isFormValid: () => true
    },
    delays: {
      REDIRECT_DELAY: 3000
    }
  }).createMachine({
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
      teamName: ''
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
          src: ({ input }) => Promise.resolve(input.initialReportData),
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
            guard: 'isFormValid'
          },
          SUBMIT: {
            target: 'submitting',
            guard: 'isFormValid'
          }
        }
      },
      // Saving form as draft
      savingDraft: {
        invoke: {
          src: ({ input, self }) => {
            const context = self.getSnapshot().context;
            return input.submitReport(context, 'draft');
          },
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
          src: ({ input, self }) => {
            const context = self.getSnapshot().context;
            return input.submitReport(context, 'submitted');
          },
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
          REDIRECT_DELAY: 'redirecting'
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

  return machine;
};

export default createReportFormMachine;