import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMachine } from '@xstate/react';
import { createReportFormMachine } from '../../machines/reportFormMachine';

/**
 * Simple hook that uses the XState machine for form state
 */
const useReportFormMachine = ({
  threadId,
  keyFragment,
  teamName,
  initialReportData = null,
  readOnly = false,
  messageIndex = null,
  updateReferenceData,
}) => {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  
  // Create a new row with a unique ID
  const getNewRow = () => ({
    id: Date.now(),
    platform: "",
    projectInitiative: "",
    sdlcStep: "",
    sdlcTask: "",
    taskCategory: "",
    estimatedTimeWithoutAI: "",
    actualTimeWithAI: "",
    timeSaved: "",
    complexity: "",
    qualityImpact: "",
    aiToolsUsed: [],
    taskDetails: "",
    notesHowAIHelped: "",
  });

  // Initialize our machine
  const [state, send] = useMachine(createReportFormMachine());

  // Initialize the machine when component mounts
  useEffect(() => {
    console.log('Initializing state machine');
    // Initialize with default rows if no initialReportData
    if (!initialReportData) {
      setRows([getNewRow()]);
    }
    send({ type: 'INITIALIZE' });
    
    // Simulate loading completion
    setTimeout(() => {
      send({ type: 'LOAD_SUCCESS' });
    }, 500);
  }, []);

  // Expose a similar API as the previous hook
  return {
    // State machine access
    state: state.value,
    context: state.context,
    send,
    
    // Form data (mix of machine context and local state)
    teamMember: state.context.teamMember || '',
    teamRole: state.context.teamRole || '',
    rows: rows,
    expandedRows: expandedRows,
    isReadOnly: readOnly,
    
    // Status indicators based on current state
    isSubmitting: state.value === 'submitting' || state.value === 'savingDraft',
    isSuccess: state.value === 'success',
    isError: state.value === 'error',
    error: state.context.error,
    success: state.context.success,
    successMessage: state.context.successMessage,
    
    // Actions to dispatch events to the machine
    updateTeamMember: (value) => {
      send({ type: 'UPDATE_TEAM_MEMBER', value });
    },
    updateTeamRole: (value) => {
      send({ type: 'UPDATE_TEAM_ROLE', value });
    },
    updateField: (id, field, value) => {
      send({ type: 'UPDATE_FIELD', id, field, value });
      
      // Also update local state
      setRows(prevRows => 
        prevRows.map(row => 
          row.id === id ? { ...row, [field]: value } : row
        )
      );
    },
    updateSDLCStep: (id, value) => {
      // Reset sdlcTask when sdlcStep changes
      setRows(prevRows => 
        prevRows.map(row => 
          row.id === id ? { ...row, sdlcStep: value, sdlcTask: '' } : row
        )
      );
    },
    toggleRowExpansion: (id) => {
      setExpandedRows(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    },
    addRow: () => {
      const newRow = getNewRow();
      setRows(prev => [...prev, newRow]);
      setExpandedRows(prev => ({
        ...prev,
        [newRow.id]: true
      }));
    },
    removeRow: (id) => {
      setRows(prev => prev.filter(row => row.id !== id));
      setExpandedRows(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    },
    saveAsDraft: () => {
      send({ type: 'SAVE_DRAFT' });
      
      // Simulate save success
      setTimeout(() => {
        send({ type: 'SAVE_SUCCESS' });
      }, 1000);
    },
    submitForm: () => {
      send({ type: 'SUBMIT' });
      
      // Simulate submit success
      setTimeout(() => {
        send({ type: 'SUBMIT_SUCCESS' });
      }, 1000);
    },
    retry: () => {
      send({ type: 'RETRY' });
    }
  };
};

export default useReportFormMachine;