/**
 * Simple XState machine for the Report Form 
 * Using XState v5 syntax with JS
 */
import { createMachine } from 'xstate';

/**
 * Creates a basic report form state machine
 * @returns {StateMachine} - XState state machine for the report form
 */
export const createReportFormMachine = () => {
  return createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QGMD2A7ALgYgDKoDEAygIIDCYADmAN4CyE4AdANoAMAuoqAA4B0AMWaIQAD0QBaAEwA2ACwB2agQCs2xeoA0IAJ6JN85ZrGaA7AFYATGYAcxvYoWaANCCPEThw4WKLbTnQLVbU0tBHs1P1VVd2sTHWJfAF8kwOQ0TFxCAEEAZQAVEhx8QlJyCipaOmx6Jj1eNioKZRNDY14THho7OGEtXnUIElYBNtsiXyChUXFFSv5q2vNaxv6OoKbW9p7I6MQYuIRksjRMHABJRDw0fDmsPELJnD4AQSnD5EwEREQAVTm0AAUXgBZH4AgDSNkA8v8AIqQqFMIh-GQrGT2ZRbGhaNSLGwmZQY4jYuhY1HEhikWhEjHCfyybGeHx+PGEkmk7o9PqIMZ4AAWrGqAGVWnAQGCZoiYMiwRs5HI+eYBULRZcttstjKFSdlcjbgYpDRXO5pfQZbLWMtzhciQSALJLRDYHAYvqTZ4GZU6C38Cy8p5s2yqOwaHRKsxYszc-w6LQmdQ+7mCuEI5FC0WSoTSoPgd7vYY-TSGbR-HQI1lKZnE0ZKebLGhTGRY9wyKOshNcuQ57ncn0JpO+tOulGgKgYHAAcwARgALEEbdE0Sh0BtSoA */
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
          INITIALIZE: 'loading'
        }
      },
      loading: {
        on: {
          LOAD_SUCCESS: 'editing',
          LOAD_ERROR: 'error'
        }
      },
      editing: {
        on: {
          SAVE_DRAFT: 'savingDraft',
          SUBMIT: 'submitting',
          UPDATE_FIELD: {
            actions: ({ context, event }) => {
              console.log('Field updated:', event);
            }
          },
          UPDATE_TEAM_MEMBER: {
            actions: ({ context, event }) => {
              context.teamMember = event.value;
            }
          },
          UPDATE_TEAM_ROLE: {
            actions: ({ context, event }) => {
              context.teamRole = event.value;
            }
          }
        }
      },
      savingDraft: {
        on: {
          SAVE_SUCCESS: 'success',
          SAVE_ERROR: 'error'
        }
      },
      submitting: {
        on: {
          SUBMIT_SUCCESS: 'success',
          SUBMIT_ERROR: 'error'
        }
      },
      success: {
        after: {
          3000: 'redirecting'
        }
      },
      redirecting: {
        type: 'final'
      },
      error: {
        on: {
          RETRY: 'editing'
        }
      }
    }
  });
};

export default createReportFormMachine;