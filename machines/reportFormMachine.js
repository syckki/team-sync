/**
 * State machine for the Report Form
 * This defines all possible states and transitions for the form
 */

import { createMachine } from './customMachine';

/**
 * Creates a state machine for the report form
 * @param {Object} initialContext - Initial machine context
 * @returns {Object} Report form state machine
 */
export const createReportFormMachine = (initialContext = {}) => createMachine({
  id: 'reportForm',
  context: {
    formData: {},
    errors: {},
    success: null,
    ...initialContext
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        EDIT: 'editing',
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
          cond: 'isFormValid',
          actions: 'validateForm'
        },
        SUBMIT: {
          target: 'submitting',
          cond: 'isFormValid',
          actions: 'validateForm'
        },
        ADD_ROW: {
          actions: 'addRow'
        },
        REMOVE_ROW: {
          actions: 'removeRow'
        },
        UPDATE_FIELD: {
          actions: 'updateField'
        },
        TOGGLE_ROW: {
          actions: 'toggleRowExpansion'
        },
        VALIDATE: {
          actions: 'validateForm'
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
        3000: {
          target: 'redirecting',
          actions: 'resetForm'
        }
      },
      on: {
        REDIRECT_NOW: 'redirecting'
      }
    },
    redirecting: {
      entry: 'redirectToChannelInbox',
      type: 'final'
    },
    error: {
      on: {
        RETRY: 'editing'
      }
    }
  }
});