/**
 * State machine for the Report Form
 * This defines all possible states and transitions for the form
 */

import { createMachine, assign } from 'xstate';

/**
 * Creates a state machine for the report form
 * @param {Object} initialContext - Initial context for the form
 * @returns {import('xstate').StateMachine} - State machine instance
 */
export const createReportFormMachine = (initialContext) => createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAUCGtYHcD2AnMAwiALIAOAFgJAB2A9rOahgDaqkAWIDA1gLZw4AkvADCAUWCYO2KKAB0osClCg8YACgCUcsXOo16jZjLYAWACwAaEAE9EosvqP1tT+wF8XB5Bhy4A4oQQokYCgRbOFjZ2RPIKynLIcgAqVAAqVADKclmsiipaRiZmFta2iK5KcIj+IH5sPIbSZBIghQXFqeqVmtSVcpoNOvpGpjb2jggATE7Ort6IPsj+ysHqmppCEQIZWTn5oMWGSCWauiV1DU3ZrXmdPYg9Qf2jg2PBLNII0nNZ09MLLMlntrF4do4jkpjCczo5zpcbndHs83l9fv9VkC1hstjtpD5ZE9XoC5qtYZsEZDlPM4fYVosVLFXN5PC4PD0XMSbCYcdosJo0RiZBo1M5XO5PqwWCxgXtgbYARtQQc9lJ5rELE84op5KwSXjsZoKZo-JKVgpXNzKDyBUKRWKJVKZXK0fKlSqkRrNdqdaM9UcTVIzSMrRbqbbbYiEQ5FFokU6UfC8aSkYH3GiPPV3CGw9yIzSo7G8QmZC50yn6ekM5kWXNXWdBVnhZKrEcOXlVOo9HzpYKuTXRwzx+OgJPJtMKVY2DZbHZ8gPLdabc3bKQHXan7Aew5ew4QEXnc9dVzqHna-WSQFSA3XdQ2R2uwl3lXVHt+9bSPK6Zni+pRvm+H5fuBaagRBhQRlimopGoQrBqKExhOO0hSphmgZMKWqQZB+haodh15KiR5GXlRD6VoBwGhnB+F5OmgbptmAa0U2RHJqR6YUZmwrzDmkzhhmkbdBM6x4QRUZkSOlHUS26YcQOQ7vpOm7TqeiLHiep7npeX5lABhYvspEHqfptR6SZDTGcZplmRZm7WfBYYIf0UyBC5JwSahHQdEIIgNGkjT9A5LlIdFFZeT5MH+YFwXhaFEXueFUWRfFNnJZpUJWcMYgTNMMwLA0ERYrsEUqVlwbZXFuX4YV7FlRVVWlrF8UZAlIVJZFDFxSmcwJHMcSZHYEgqEVywqHWUiUaqJW1YRHlVfFdUNVOKa9UNI09c1E1TRWaaZiW+aFvtxYQYdR0vKdlRnddznvRFtYOXVaYNXVbXrb1MVBbFmXzXlnX-kDQMXaDl1dmdwM3akd3sA9T0vUgbjvZ9KCTcxbkOe537+Qjt0I-V4ErdtMP7QdR3I9Vp2YzGhWxgm6WcDmcaE49BXPYTxOvXFSWY49z3Y5WKU0xliY00tVMrRts0M0zLNDbzKU52tgkC8JhQPAUnwM1zbOc9z1Xaw1-O89zL69YLC0rYL2vi1L0uTbtkBKKrKt4JrfMDOUEx7FiOwTEcvPHGsvNnFlws5flhXFQbp0G2bPUW71VsDQVEPyGVeVVQnNvVZ1KUnDlQv5YTxXuz78ue4rlfez7deN6l-v+8VnfVX3-dD4l-UZcP1Uj3TXvB9r-sx4NMPRP7-vO-78fx-FXfJ2nGdZ9nlSRkW0YFxPcfuhPXe9z3oeP3Uuf7DvnM+fMQECw7GLSW0sZYe3lnLBWStVZqw1lrHWes9aGw1qbauZtKAWzsEoCM+DLZCw1oeeuLdDZwHPqxIBnce6IOBrg-BKDCEe09t7X2-ti4lzLr4DuVcwJ107mXUOLdK7t1IUPVAo887jw4Ew5hrdLYsLYRw0OZ9JaX2hq5YuwjgF3w-tfPmN8B41woTAuhdCf4oN7g3MsA8h4jwphPae08tyz0xvLeeYssGLxESrd+h9P7HwgUJWhKCp6Y0Yeb-QREVbUzRrTbG+NSai3FpLeWcsla6yVirI2ZtzaW2UbbB27tbZqLdgoyuHt-7oMDtg0MrcmFt04R3LunduE9y4XRNSTsiGPw3iPee88CF31IRQ1+ojP5iI-j-bRf9SE6LARIoBUCYGwK7LAvBBjCHZwsWHKxVjbE2Mca4vhHjvG+MCcEvRwTQlRIiaoxJKTsk3yyVk3JQDcnFMKSUopJTUn5IyVkq8+TwFFNKWU2J5TynVJqXUhps9mk2MFAM4Z7SbHdL6QMoZIyxlTP6aM0ZA5zEmMsRM6ZmixnTI0TMuZ6yN5bJ2bsw5xzzlnMHknS5o8NljM2eMotJaZnloWTsjZ5avahROdWs57adnNv2as-Zn9NnYJOXs7ZLbUHELISQ3pByKH8N4Z-FBrD0GtyeTw4+ojrlXMeb5e5JzHnyPBRnbFeTCmks1v5ehqCwGS25mfN+RLI49KEeyuR-KvkEtiUUyeqLI7otRQ3Gp9jz4YsxbS7FkLcX4qJUQklOKyU5ISaSqlNK6UMqQoy1lbLOUkrIQatlyqmVVzZaq-F08OWvKwTyol1LyV-1JYqilyrJXgtJXFblIKRW0ulg-QVEqpVStldKm1c8HVOs9V63liqRVipFQzaV8r-WKqdcK2hvLw2SvlYqkVz9lW-31bMbVdqnVGuIWG+Z4roHLLZSGlx0a1UxpTWm0h3js11tRWS+tBLfHNujW25N-qs0ZpTVW0tNb+20rrf2+xg7XVFvKRO8dU6Z0zvnYupd3bV39t9YO5dqrnUkvMTuld066WYLXXMJdPCO2e38t3fytt2LJaHu3dK9Np7r3Nuvfexdgq72vvffw598rb1DsA8BtdY7IPhq1eGyVs77Xmu-Y+19ydP2frjZ+r9gHQMgfA7KqDSHAOJug+hoNcHEmJuTaghDqa0PesEzmtD96l3YYw4qnDxGu3ke3YusjeHhVEbA5RyjWHdVMZI-Rpj9HFVsZYyWtjHGeMrtYzxvjfGBMCaE2JiTUnpMKdkwpj1w7VOqc03pvTBnvVGY0wZjd0ntOGbaxZ77Vn93Wbs+p+z2nXO6e875vz-nAshfC9uoLEWfNvri1sI9aXnUHvS4+tNiWMsZY0ylnLrGCsFbR-ugrRWUs0ey7tjrQmKscxAwAA */
  id: 'reportForm',
  initial: 'idle',
  context: {
    ...initialContext,
    formData: {
      role: '',
      dateCreated: '',
      productivityRatings: [],
      aiPlatform: '',
      aiUsageRating: '',
      hoursSpent: '',
      hoursProductive: '',
      sdlcStep: '',
      sdlcTask: '',
      primaryContribution: '',
      teamMembersAffected: '',
      successRate: '',
      projectImpact: '',
    },
    expandedRows: new Set(),
    errors: {},
    successMessage: '',
    isSaving: false,
    isSubmitting: false,
    messageIndex: null,
    threadId: '',
  },
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
          actions: 'validateForm',
          cond: 'isFormValid'
        },
        SUBMIT: {
          target: 'submitting',
          actions: 'validateForm',
          cond: 'isFormValid'
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
      }
    },
    redirecting: {
      entry: 'redirectToChannelInbox',
      type: 'final'
    },
    error: {
      on: {
        RETRY: {
          target: 'editing'
        }
      }
    }
  }
}, {
  actions: {
    resetForm: assign({
      formData: () => ({
        role: '',
        dateCreated: new Date().toISOString().split('T')[0],
        productivityRatings: [],
        aiPlatform: '',
        aiUsageRating: '',
        hoursSpent: '',
        hoursProductive: '',
        sdlcStep: '',
        sdlcTask: '',
        primaryContribution: '',
        teamMembersAffected: '',
        successRate: '',
        projectImpact: '',
      }),
      expandedRows: () => new Set(),
      errors: () => ({}),
      successMessage: () => '',
      isSaving: () => false,
      isSubmitting: () => false,
    }),
    
    setInitialFormData: assign((context, event) => {
      const { formData } = event.data;
      return {
        formData: formData || context.formData,
        messageIndex: event.data.messageIndex || null,
        threadId: event.data.threadId || '',
      };
    }),
    
    updateField: assign({
      formData: (context, event) => {
        const { field, value, rowIndex } = event.data;
        
        if (rowIndex !== undefined && field.startsWith('productivityRatings.')) {
          const propertyName = field.split('.')[1];
          const updatedRatings = [...context.formData.productivityRatings];
          
          if (!updatedRatings[rowIndex]) {
            updatedRatings[rowIndex] = {};
          }
          
          updatedRatings[rowIndex] = {
            ...updatedRatings[rowIndex],
            [propertyName]: value
          };
          
          return {
            ...context.formData,
            productivityRatings: updatedRatings
          };
        }
        
        return {
          ...context.formData,
          [field]: value
        };
      },
      errors: (context, event) => {
        const { field } = event.data;
        const newErrors = { ...context.errors };
        
        // Clear error for the updated field
        delete newErrors[field];
        
        return newErrors;
      }
    }),
    
    addRow: assign({
      formData: (context) => {
        const newRow = {
          title: '',
          description: '',
          aiUsageDescription: '',
          estimatedHours: '',
          actualHours: '',
          efficiency: '',
          impact: ''
        };
        
        return {
          ...context.formData,
          productivityRatings: [
            ...context.formData.productivityRatings,
            newRow
          ]
        };
      },
      expandedRows: (context) => {
        const newExpandedRows = new Set(context.expandedRows);
        newExpandedRows.add(context.formData.productivityRatings.length);
        return newExpandedRows;
      }
    }),
    
    removeRow: assign({
      formData: (context, event) => {
        const { rowIndex } = event.data;
        const updatedRatings = [...context.formData.productivityRatings];
        updatedRatings.splice(rowIndex, 1);
        
        return {
          ...context.formData,
          productivityRatings: updatedRatings
        };
      },
      expandedRows: (context, event) => {
        const { rowIndex } = event.data;
        const newExpandedRows = new Set();
        
        // Rebuild the set of expanded rows with updated indices
        context.expandedRows.forEach(idx => {
          if (idx < rowIndex) {
            newExpandedRows.add(idx);
          } else if (idx > rowIndex) {
            newExpandedRows.add(idx - 1);
          }
        });
        
        return newExpandedRows;
      }
    }),
    
    toggleRowExpansion: assign({
      expandedRows: (context, event) => {
        const { rowIndex } = event.data;
        const newExpandedRows = new Set(context.expandedRows);
        
        if (newExpandedRows.has(rowIndex)) {
          newExpandedRows.delete(rowIndex);
        } else {
          newExpandedRows.add(rowIndex);
        }
        
        return newExpandedRows;
      }
    }),
    
    validateForm: assign({
      errors: (context) => {
        const { formData } = context;
        const errors = {};
        
        // Validate required fields
        if (!formData.role) errors.role = 'Role is required';
        if (!formData.aiPlatform) errors.aiPlatform = 'AI Platform is required';
        if (!formData.primaryContribution) errors.primaryContribution = 'Primary Contribution is required';
        
        // Validate numeric fields
        if (formData.hoursSpent && isNaN(parseFloat(formData.hoursSpent))) {
          errors.hoursSpent = 'Hours Spent must be a number';
        }
        
        if (formData.hoursProductive && isNaN(parseFloat(formData.hoursProductive))) {
          errors.hoursProductive = 'Productive Hours must be a number';
        }
        
        // Validate hours productive <= hours spent
        if (
          formData.hoursSpent && 
          formData.hoursProductive &&
          parseFloat(formData.hoursProductive) > parseFloat(formData.hoursSpent)
        ) {
          errors.hoursProductive = 'Productive Hours cannot exceed Hours Spent';
        }
        
        // Validate productivity ratings
        if (formData.productivityRatings.length === 0) {
          errors['productivityRatings'] = 'At least one productivity rating is required';
        } else {
          formData.productivityRatings.forEach((rating, index) => {
            if (!rating.title) {
              errors[`productivityRatings.${index}.title`] = 'Title is required';
            }
            
            if (rating.estimatedHours && isNaN(parseFloat(rating.estimatedHours))) {
              errors[`productivityRatings.${index}.estimatedHours`] = 'Est. Hours must be a number';
            }
            
            if (rating.actualHours && isNaN(parseFloat(rating.actualHours))) {
              errors[`productivityRatings.${index}.actualHours`] = 'Act. Hours must be a number';
            }
          });
        }
        
        return errors;
      }
    }),
    
    setSuccess: assign({
      successMessage: (_, event) => event.data.message || 'Report saved successfully',
      isSaving: () => false,
      isSubmitting: () => false
    }),
    
    setLoadError: assign({
      errors: (_, event) => ({ loadError: event.data.message || 'Failed to load report data' })
    }),
    
    setSaveError: assign({
      errors: (_, event) => ({ saveError: event.data.message || 'Failed to save draft' }),
      isSaving: () => false
    }),
    
    setSubmitError: assign({
      errors: (_, event) => ({ submitError: event.data.message || 'Failed to submit report' }),
      isSubmitting: () => false
    })
  },
  
  guards: {
    isFormValid: (context) => {
      // Check if there are any validation errors
      return Object.keys(context.errors).length === 0;
    }
  }
});