import { useCallback, useMemo } from 'react';
import { useMachine } from '@xstate/react';
import { createReportFormMachine } from '../machines/reportFormMachine';
import { useRouter } from 'next/router';
import useReportForm from './form/useReportForm';
import useReportSubmission from './crypto/useReportSubmission';

/**
 * Hook that integrates the report form state machine
 * with the existing form and submission hooks
 */
export const useReportFormMachine = (initialData = {}, threadId = null, encryptionKey = null) => {
  const router = useRouter();
  
  // Use the existing hooks
  const {
    formData,
    errors,
    setFormData,
    validateForm,
    resetForm,
    addDataRow,
    removeDataRow,
    toggleRowExpansion,
    isFormValid,
    prepareFormData,
  } = useReportForm(initialData);
  
  const {
    submitReport,
    saveReportDraft,
    isSubmitting,
    submissionError,
  } = useReportSubmission(threadId, encryptionKey);

  // Create context for the state machine
  const machineContext = useMemo(() => ({
    formData,
    threadId,
    encryptionKey,
    status: 'idle',
    message: '',
    errors: {},
  }), [formData, threadId, encryptionKey]);

  // Define the actions and services for the machine
  const machineOptions = useMemo(() => ({
    actions: {
      resetForm: () => resetForm(),
      setInitialFormData: (_, event) => setFormData(event.data || initialData),
      validateForm: () => validateForm(),
      addRow: (_, event) => addDataRow(event.rowType),
      removeRow: (_, event) => removeDataRow(event.rowIndex, event.rowType),
      updateField: (_, event) => {
        const { name, value } = event;
        setFormData(prev => ({
          ...prev,
          [name]: value,
        }));
      },
      toggleRowExpansion: (_, event) => toggleRowExpansion(event.rowIndex),
      setSuccess: (context, event) => {
        const redirectUrl = `/channel/${event.data.threadId}#${encryptionKey}`;
        setTimeout(() => router.push(redirectUrl), 2000);
      },
      redirectToChannelInbox: (context) => {
        const redirectUrl = `/channel/${context.threadId}#${context.encryptionKey}`;
        router.push(redirectUrl);
      },
      setLoadError: (context, event) => {
        console.error('Failed to load report data:', event.data);
      },
      setSaveError: (context, event) => {
        console.error('Failed to save draft:', event.data);
      },
      setSubmitError: (context, event) => {
        console.error('Failed to submit report:', event.data);
      },
    },
    services: {
      loadReportData: async () => {
        // If we have initial data, just return it
        // In a real implementation, this might load data from an API
        return initialData;
      },
      saveDraft: async () => {
        const preparedData = prepareFormData(formData, 'draft');
        const result = await saveReportDraft(preparedData);
        return result;
      },
      submitForm: async () => {
        const preparedData = prepareFormData(formData, 'submitted');
        const result = await submitReport(preparedData);
        return result;
      },
    },
    guards: {
      isFormValid: () => isFormValid(),
    },
  }), [
    resetForm, 
    setFormData, 
    validateForm, 
    addDataRow, 
    removeDataRow, 
    toggleRowExpansion, 
    router, 
    initialData, 
    encryptionKey,
    formData,
    prepareFormData,
    saveReportDraft,
    submitReport,
    isFormValid
  ]);

  // Create the state machine
  const reportFormMachine = useMemo(() => 
    createReportFormMachine(machineContext), 
    [machineContext]
  );
  
  // Use the machine with XState
  const [state, send] = useMachine(reportFormMachine, machineOptions);

  // Create handlers that send events to the state machine
  const handleSubmit = useCallback(() => {
    send('SUBMIT');
  }, [send]);

  const handleSaveDraft = useCallback(() => {
    send('SAVE_DRAFT');
  }, [send]);

  const handleAddRow = useCallback((rowType) => {
    send({ type: 'ADD_ROW', rowType });
  }, [send]);

  const handleRemoveRow = useCallback((rowIndex, rowType) => {
    send({ type: 'REMOVE_ROW', rowIndex, rowType });
  }, [send]);

  const handleToggleRow = useCallback((rowIndex) => {
    send({ type: 'TOGGLE_ROW', rowIndex });
  }, [send]);

  const handleChange = useCallback((name, value) => {
    send({ type: 'UPDATE_FIELD', name, value });
  }, [send]);

  // Initialize the state machine
  const initialize = useCallback(() => {
    send('INITIALIZE');
  }, [send]);

  return {
    state,
    formData,
    errors: state.context.errors || errors,
    isSubmitting: ['submitting', 'savingDraft'].includes(state.value),
    isSuccess: state.matches('success'),
    isError: state.matches('error'),
    initialize,
    handleSubmit,
    handleSaveDraft,
    handleAddRow,
    handleRemoveRow,
    handleToggleRow,
    handleChange,
  };
};