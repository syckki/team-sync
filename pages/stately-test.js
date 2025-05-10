import React from 'react';
import { createMachine, assign } from 'xstate';
import { useMachine } from '@xstate/react';

// Define a simple counter machine
const counterMachine = createMachine({
  id: 'counter',
  initial: 'active',
  context: {
    count: 0,
  },
  states: {
    active: {
      on: {
        INCREMENT: {
          actions: assign({
            count: ({ context }) => context.count + 1,
          }),
        },
        DECREMENT: {
          actions: assign({
            count: ({ context }) => context.count - 1,
          }),
        },
        RESET: {
          actions: assign({
            count: 0,
          }),
        },
      },
    },
  },
});

export default function StatelyTest() {
  const [state, send] = useMachine(counterMachine);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">XState v5 Test</h1>
      
      <div className="mb-4">
        <p className="text-xl">Current count: {state.context.count}</p>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => send({ type: 'INCREMENT' })}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Increment
        </button>
        
        <button
          onClick={() => send({ type: 'DECREMENT' })}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Decrement
        </button>
        
        <button
          onClick={() => send({ type: 'RESET' })}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Current State:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({ 
            value: state.value,
            context: state.context
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}