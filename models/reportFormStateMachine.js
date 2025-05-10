/**
 * This file is used to visualize the report form state machine
 * It's not meant to be used in the application directly, but rather
 * to copy into the Stately Visualizer to generate a visual representation.
 */

import { createMachine } from 'xstate';

/**
 * This machine represents the flow of the report form:
 * - It starts in idle state
 * - Moves to loading when initialized
 * - Goes to editing after loading report data
 * - Can transition to saving draft or submitting
 * - Shows success or error states based on operations
 * - Redirects to channel inbox after success
 */

export const reportFormMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOhAMTbbYEAuuA9gDY4BuA2gAwC6ioADuWAAOmEAE9EAJgDMANmwA2ADQgAntKUBOGQE5sAVj27VAFhN7t+gDQgAnpL37VF7ZqVH9NzXuPr9ANh9A3QBfELdELHwiEnJKHHtOHDx8QhI5ZVV1bDUcHRRtPRMzSxs7RBkFJTdSdQ1DJVURHQtjPW19P1CwhGwcfCISckoaemY2DlyF4zNLGwQHJzsZJVV1TQRdA2MF43Mb231lFtCnKZ8I6JiCVMIcJJSqXeZWdgLC7qUBxBLrscLVdUa7S6vX6gzQI1KFzKJCq1SKAEYlgt9iArFdTutYBtrpALndJrNLq9kKlHiVnt1XqU5tFZoR5i11vNNgTWMTSB1ujcbj1YJAAGr8QYSWlTAC63h5fMurEF0KlGzORQ00MuBW0pXuq0eKqZataLzW-KezFZcM1cO1j11bF1Awm7Bmk0KAEU0KEMKEFqzZRyKvDYZ6vXDEba6eTdu6kGtSrt1j7NmdvRafcxCIHAxdQ9crjdI3rU8afoRk8qbksNRRkYntj6Sqz6hsuU1wJ7jpteT9eQKgA */
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
    idle: {
      on: {
        INITIALIZE: {
          target: 'loading',
          actions: 'resetForm'
        }
      }
    },
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
    editing: {
      on: {
        SAVE_DRAFT: {
          target: 'savingDraft',
          guard: 'isFormValid' 
        },
        SUBMIT: {
          target: 'submitting',
          guard: 'isFormValid'
        },
        UPDATE_FIELD: {
          actions: 'updateField'
        },
        UPDATE_TEAM_MEMBER: {
          actions: 'updateTeamMember'
        },
        UPDATE_TEAM_ROLE: {
          actions: 'updateTeamRole'
        },
        ADD_ROW: {
          actions: 'addRow'
        },
        REMOVE_ROW: {
          actions: 'removeRow'
        },
        TOGGLE_ROW: {
          actions: 'toggleRowExpansion'
        }
      }
    },
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
    success: {
      after: {
        3000: 'redirecting'
      }
    },
    redirecting: {
      entry: 'redirectToInbox',
      type: 'final'
    },
    error: {
      on: {
        RETRY: 'editing'
      }
    }
  }
});