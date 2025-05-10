import { useMachine } from '@xstate/react';
import { createMachine, assign } from 'xstate';
import { useRouter } from 'next/router';
import { encryptData } from '../../lib/cryptoUtils';
import { addMessageToThread } from '../../lib/thread';
import { queueMessage } from '../../lib/dbService';

/**
 * Round time to the nearest quarter hour (0.00, 0.25, 0.50, 0.75)
 * @param {number|string} time - Time value to round
 * @returns {string} - Rounded time as string with 2 decimal places
 */
const roundToQuarterHour = (time) => {
  if (!time) return '';
  const value = parseFloat(time);
  if (isNaN(value)) return '';
  
  const rounded = Math.round(value * 4) / 4;
  return rounded.toFixed(2);
};

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
 * Custom hook that combines the report form state machine with business logic
 * @param {Object} props - Props for the hook
 * @param {string} props.threadId - The thread ID for the report
 * @param {string} props.keyFragment - The key fragment for encryption
 * @param {string} props.teamName - The team name for the report
 * @param {Object} props.initialReportData - Initial report data (if any)
 * @param {boolean} props.readOnly - Whether the form is read-only
 * @param {number|null} props.messageIndex - Message index for editing existing reports
 * @param {Function} props.updateReferenceData - Function to update reference data
 * @returns {Object} - State machine interface and form operations
 */
const useReportFormMachine = ({ 
  threadId, 
  keyFragment,
  teamName, 
  initialReportData,
  readOnly = false,
  messageIndex = null,
  updateReferenceData = async () => true
}) => {
  const router = useRouter();

  // Define the machine directly in the hook following XState v5 pattern
  const reportFormMachine = createMachine({
    id: 'reportForm',
    initial: 'idle',
    context: {
      // Form data
      teamMember: '',
      teamRole: '',
      rows: [getNewRow()],
      expandedRows: {},
      // Status flags
      isReadOnly: readOnly,
      error: null,
      success: false,
      successMessage: '',
      // Properties from outside
      teamName,
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
          src: async () => {
            try {
              if (initialReportData) {
                // Use provided initial data
                return initialReportData;
              }
              
              // Otherwise return empty report
              return {
                teamMember: '',
                teamRole: '',
                entries: [],
                status: 'draft'
              };
            } catch (error) {
              console.error('Error loading report data:', error);
              throw new Error('Failed to load report data');
            }
          },
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
                isReadOnly: isSubmitted || readOnly,
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
          src: async (context) => {
            try {
              // Extract data from context
              const formData = {
                teamName: context.teamName,
                teamMember: context.teamMember,
                teamRole: context.teamRole,
                entries: context.rows,
                status: 'draft',
                date: new Date().toISOString()
              };

              // Encrypt the data
              if (!keyFragment) {
                throw new Error('No encryption key fragment found');
              }
              
              const encryptedData = await encryptData(formData, keyFragment);
              
              // Save to the thread
              await addMessageToThread(
                threadId, 
                encryptedData.encryptedBuffer, 
                {
                  type: 'productivity-report',
                  reportStatus: 'draft',
                  authorId: localStorage.getItem(`author-${threadId}`) || `author-${Date.now()}`,
                  date: new Date().toISOString()
                },
                null,
                messageIndex
              );

              // Queue for sync if offline
              await queueMessage(
                threadId,
                encryptedData.encryptedBuffer,
                {
                  type: 'productivity-report',
                  reportStatus: 'draft'
                }
              );
              
              // Update report tracking data
              await updateReferenceData();
              
              return { 
                success: true,
                message: 'Report saved as draft successfully'
              };
            } catch (error) {
              console.error('Error saving draft:', error);
              throw new Error('Failed to save draft report');
            }
          },
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
          src: async (context) => {
            try {
              // Extract data from context
              const formData = {
                teamName: context.teamName,
                teamMember: context.teamMember,
                teamRole: context.teamRole,
                entries: context.rows,
                status: 'submitted',
                date: new Date().toISOString()
              };

              // Encrypt the data
              if (!keyFragment) {
                throw new Error('No encryption key fragment found');
              }
              
              const encryptedData = await encryptData(formData, keyFragment);
              
              // Save to the thread
              await addMessageToThread(
                threadId, 
                encryptedData.encryptedBuffer, 
                {
                  type: 'productivity-report',
                  reportStatus: 'submitted',
                  authorId: localStorage.getItem(`author-${threadId}`) || `author-${Date.now()}`,
                  date: new Date().toISOString()
                },
                null,
                messageIndex
              );

              // Queue for sync if offline
              await queueMessage(
                threadId,
                encryptedData.encryptedBuffer,
                {
                  type: 'productivity-report',
                  reportStatus: 'submitted'
                }
              );

              // Update report tracking data
              await updateReferenceData();
              
              return { 
                success: true,
                message: 'Report submitted successfully'
              };
            } catch (error) {
              console.error('Error submitting report:', error);
              throw new Error('Failed to submit report');
            }
          },
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
        entry: () => {
          router.push(`/channel/${threadId}#${keyFragment}`);
        },
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

  // Use the machine directly
  const [state, send] = useMachine(reportFormMachine);

  // Get commonly used state values
  const context = state.context;
  const isSubmitting = state.matches('submitting') || state.matches('savingDraft');
  const isSuccess = state.matches('success');
  const isError = state.matches('error');

  return {
    // Basic state machine access
    state,
    context,
    send,
    // Form state
    teamMember: context.teamMember,
    teamRole: context.teamRole,
    rows: context.rows,
    expandedRows: context.expandedRows,
    isReadOnly: context.isReadOnly,
    // Status indicators
    isSubmitting,
    isSuccess,
    isError,
    error: context.error,
    success: context.success,
    successMessage: context.successMessage,
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

export default useReportFormMachine;