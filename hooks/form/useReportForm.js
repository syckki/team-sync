/**
 * Hook for managing report form state and validation
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Custom hook for form state management
 * @param {Object} options - Configuration options
 * @param {Object} options.initialData - Initial form data
 * @param {Function} options.onSubmit - Form submission handler
 * @param {Function} options.onSaveDraft - Draft saving handler
 * @returns {Object} Form state and handlers
 */
export const useReportForm = ({
  initialData = {},
  onSubmit,
  onSaveDraft
}) => {
  // Form state
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);
  const router = useRouter();

  // Update form data if initialData changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Field update handler
  const updateField = useCallback((field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Add row to a section
  const addRow = useCallback((section, defaults = {}) => {
    setFormData(prevData => {
      const sectionData = prevData[section] || [];
      return {
        ...prevData,
        [section]: [
          ...sectionData,
          { id: Date.now().toString(), ...defaults }
        ]
      };
    });
  }, []);

  // Remove row from a section
  const removeRow = useCallback((section, id) => {
    setFormData(prevData => {
      const sectionData = prevData[section] || [];
      return {
        ...prevData,
        [section]: sectionData.filter(item => item.id !== id)
      };
    });
  }, []);

  // Toggle row expansion
  const toggleRow = useCallback((rowId) => {
    setExpandedRows(prevRows => {
      return prevRows.includes(rowId)
        ? prevRows.filter(id => id !== rowId)
        : [...prevRows, rowId];
    });
  }, []);

  // Check if a row is expanded
  const isRowExpanded = useCallback((rowId) => {
    return expandedRows.includes(rowId);
  }, [expandedRows]);

  // Form validation
  const validate = useCallback(() => {
    const newErrors = {};
    
    // Basic required field validation
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Title is required';
    }

    // Check for minimum required data in dynamically added sections
    if (formData.aiTools && formData.aiTools.length === 0) {
      newErrors.aiTools = 'At least one AI tool must be added';
    }

    // Add more validation rules as needed
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Create a generic submission handler that can handle both draft saving and final submission
  const handleSubmission = useCallback(async (type) => {
    const isValid = validate();
    if (!isValid) return false;

    setLoading(true);
    setSuccess(null);

    try {
      // Prepare form data (move any special preparation to the consumer of this hook)
      const preparedData = { ...formData };
      
      // Call the appropriate handler based on type
      let result;
      if (type === 'draft') {
        result = await onSaveDraft(preparedData, 'draft');
      } else {
        result = await onSubmit(preparedData, 'submitted');
      }
      
      setSuccess({
        message: type === 'draft' ? 'Draft saved successfully' : 'Report submitted successfully',
        ...result
      });
      
      // Redirect after a success message is shown
      setTimeout(() => {
        router.push('/channels');
      }, 3000);
      
      return true;
    } catch (error) {
      console.error(`Error ${type === 'draft' ? 'saving draft' : 'submitting form'}:`, error);
      setErrors(prev => ({
        ...prev,
        form: error.message || `Failed to ${type === 'draft' ? 'save draft' : 'submit form'}`
      }));
      return false;
    } finally {
      setLoading(false);
    }
  }, [formData, validate, onSubmit, onSaveDraft, router]);

  // Handlers for submission and draft saving
  const handleSubmit = useCallback(() => handleSubmission('submit'), [handleSubmission]);
  const handleSaveAsDraft = useCallback(() => handleSubmission('draft'), [handleSubmission]);

  return {
    // State
    formData,
    errors,
    loading,
    success,
    expandedRows,
    
    // Actions
    updateField,
    addRow,
    removeRow,
    toggleRow,
    validate,
    
    // Form submission
    handleSubmit,
    handleSaveAsDraft,
    
    // Helpers
    isRowExpanded,
    isValid: Object.keys(errors).length === 0
  };
};