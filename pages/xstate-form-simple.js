import React, { useState, useCallback, useEffect } from 'react';
import { createMachine, assign } from 'xstate';
import { useMachine } from '@xstate/react';

// Define a simple form machine
const formMachine = createMachine({
  id: 'simpleForm',
  initial: 'editing',
  context: {
    name: '',
    email: '',
    message: '',
    submitted: false
  },
  states: {
    editing: {
      on: {
        UPDATE_FIELD: {
          actions: assign((context, event) => ({
            ...context,
            [event.field]: event.value
          }))
        },
        SUBMIT: {
          target: 'submitting',
          // Only transition if form is valid
          guard: 'isFormValid'
        }
      }
    },
    submitting: {
      invoke: {
        src: 'submitForm',
        onDone: {
          target: 'success',
          actions: assign({ submitted: true })
        },
        onError: {
          target: 'editing',
          actions: 'setError'
        }
      }
    },
    success: {
      type: 'final'
    }
  }
});

export default function XStateFormSimple() {
  // Define our implementations
  const services = {
    submitForm: async (context) => {
      // Simulate API call
      console.log('Submitting form:', context);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    }
  };
  
  const guards = {
    isFormValid: (context) => {
      // Simple validation
      return (
        context.name.trim() !== '' && 
        context.email.trim() !== '' && 
        context.message.trim() !== ''
      );
    }
  };
  
  const actions = {
    setError: assign({
      error: 'There was an error submitting the form'
    })
  };
  
  // Create our machine instance
  const [state, send] = useMachine(formMachine, {
    services,
    guards,
    actions
  });
  
  // Create handlers for form fields
  const handleFieldChange = useCallback((field) => (e) => {
    send({
      type: 'UPDATE_FIELD',
      field,
      value: e.target.value
    });
  }, [send]);
  
  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    send({ type: 'SUBMIT' });
  }, [send]);
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">XState Simple Form</h1>
      
      {state.matches('success') ? (
        <div className="bg-green-100 p-4 rounded mb-4">
          <p className="text-green-700">Form submitted successfully!</p>
          <pre className="mt-2 bg-gray-100 p-2 rounded">
            {JSON.stringify(state.context, null, 2)}
          </pre>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Name</label>
            <input
              type="text"
              value={state.context.name}
              onChange={handleFieldChange('name')}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={state.context.email}
              onChange={handleFieldChange('email')}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Message</label>
            <textarea
              value={state.context.message}
              onChange={handleFieldChange('message')}
              className="w-full p-2 border rounded"
              rows="4"
            />
          </div>
          
          <button
            type="submit"
            disabled={state.matches('submitting')}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
          >
            {state.matches('submitting') ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}
      
      <div className="mt-8">
        <h2 className="font-bold mb-2">Current State:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm">
          {JSON.stringify({ 
            value: state.value,
            context: state.context
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}