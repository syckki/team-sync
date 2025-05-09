/**
 * Hook for managing report form state using the state machine
 */

import { useRouter } from 'next/router';
import { useMachine } from '../machines/customMachine';
import { createReportFormMachine } from '../machines/reportFormMachine';
import { useCallback } from 'react';

/**
 * Custom hook that manages the report form state using a state machine
 * @param {object} options - Configuration options
 * @param {Function} options.onSubmit - Function to call when form is submitted
 * @param {Function} options.onSaveDraft - Function to call when form is saved as draft
 * @param {Function} options.onLoadForm - Function to load initial form data
 * @param {object} options.initialData - Initial form data
 * @returns {object} Form state and actions
 */
export const useReportFormMachine = ({ 
  onSubmit, 
  onSaveDraft, 
  onLoadForm,
  initialData = {}
}) => {
  const router = useRouter();
  const reportFormMachine = createReportFormMachine({ formData: initialData });
  
  // Actions for the state machine
  const actions = {
    resetForm: (context) => ({
      formData: initialData,
      errors: {},
      success: null
    }),
    
    setInitialFormData: (context, event) => ({
      formData: event.data || {},
      loading: false
    }),
    
    setLoadError: (context, event) => ({
      error: event.data,
      loading: false
    }),
    
    validateForm: (context) => {
      const { formData } = context;
      const errors = {};
      
      // Basic validation
      if (!formData.title || formData.title.trim() === '') {
        errors.title = 'Title is required';
      }
      
      // Add more validation as needed
      
      return { errors };
    },
    
    updateField: (context, event) => {
      const { formData } = context;
      const { field, value } = event;
      
      return {
        formData: {
          ...formData,
          [field]: value
        }
      };
    },
    
    addRow: (context, event) => {
      const { formData } = context;
      const { section } = event;
      
      if (!formData[section]) {
        formData[section] = [];
      }
      
      return {
        formData: {
          ...formData,
          [section]: [
            ...formData[section],
            { id: Date.now().toString(), ...event.defaults }
          ]
        }
      };
    },
    
    removeRow: (context, event) => {
      const { formData } = context;
      const { section, id } = event;
      
      return {
        formData: {
          ...formData,
          [section]: formData[section].filter(item => item.id !== id)
        }
      };
    },
    
    toggleRowExpansion: (context, event) => {
      const { expandedRows = [] } = context;
      const { rowId } = event;
      
      const isExpanded = expandedRows.includes(rowId);
      const newExpandedRows = isExpanded
        ? expandedRows.filter(id => id !== rowId)
        : [...expandedRows, rowId];
      
      return { expandedRows: newExpandedRows };
    },
    
    setSuccess: (context, event) => ({
      success: event.data,
      error: null
    }),
    
    setSaveError: (context, event) => ({
      error: event.data,
      success: null
    }),
    
    setSubmitError: (context, event) => ({
      error: event.data,
      success: null
    }),
    
    redirectToChannelInbox: () => {
      router.push('/channels');
    }
  };
  
  // Services for the state machine
  const services = {
    loadReportData: async (context) => {
      if (onLoadForm) {
        return await onLoadForm();
      }
      return context.formData;
    },
    
    saveDraft: async (context) => {
      if (onSaveDraft) {
        return await onSaveDraft(context.formData, 'draft');
      }
      return { status: 'draft', success: true };
    },
    
    submitForm: async (context) => {
      if (onSubmit) {
        return await onSubmit(context.formData, 'submitted');
      }
      return { status: 'submitted', success: true };
    }
  };
  
  // Guards for the state machine
  const guards = {
    isFormValid: (context) => {
      const { errors } = context;
      return Object.keys(errors).length === 0;
    }
  };
  
  const [state, send] = useMachine(reportFormMachine, { actions, services, guards });
  
  // Create handler functions
  const handleUpdateField = useCallback((field, value) => {
    send({ type: 'UPDATE_FIELD', field, value });
  }, [send]);
  
  const handleAddRow = useCallback((section, defaults = {}) => {
    send({ type: 'ADD_ROW', section, defaults });
  }, [send]);
  
  const handleRemoveRow = useCallback((section, id) => {
    send({ type: 'REMOVE_ROW', section, id });
  }, [send]);
  
  const handleToggleRow = useCallback((rowId) => {
    send({ type: 'TOGGLE_ROW', rowId });
  }, [send]);
  
  const handleSaveAsDraft = useCallback(() => {
    send('SAVE_DRAFT');
  }, [send]);
  
  const handleSubmit = useCallback(() => {
    send('SUBMIT');
  }, [send]);
  
  const handleValidate = useCallback(() => {
    send('VALIDATE');
  }, [send]);
  
  const initialize = useCallback(() => {
    send('INITIALIZE');
  }, [send]);
  
  return {
    // State
    formState: state.value,
    formData: state.context.formData,
    errors: state.context.errors,
    expandedRows: state.context.expandedRows || [],
    isLoading: state.value === 'loading' || state.value === 'savingDraft' || state.value === 'submitting',
    isSuccess: state.value === 'success',
    error: state.context.error,
    success: state.context.success,
    
    // Actions
    updateField: handleUpdateField,
    addRow: handleAddRow,
    removeRow: handleRemoveRow,
    toggleRow: handleToggleRow,
    saveAsDraft: handleSaveAsDraft,
    submit: handleSubmit,
    validate: handleValidate,
    initialize,
    
    // Helpers
    isRowExpanded: (rowId) => (state.context.expandedRows || []).includes(rowId)
  };
};