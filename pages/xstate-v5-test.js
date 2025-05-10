import { useRef } from 'react';
import { useMachine } from '@xstate/react';
import { createMachine, assign } from 'xstate';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
`;

const StateDisplay = styled.div`
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const ActionButton = styled.button`
  background-color: #4e8cff;
  color: white;
  border: none;
  padding: 8px 16px;
  margin-right: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #3a7ce0;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

/**
 * XState V5 Test Component
 * Following the exact API documentation
 */
export default function XStateV5Test() {
  // Define the machine directly
  const counterMachine = createMachine({
    id: 'counter',
    initial: 'active',
    context: {
      count: 0,
      name: ''
    },
    states: {
      active: {
        on: {
          INCREMENT: {
            actions: 'increment'
          },
          DECREMENT: {
            actions: 'decrement'
          },
          RESET: {
            actions: 'reset'
          },
          UPDATE_NAME: {
            actions: 'updateName'
          }
        }
      }
    }
  });

  // Use the machine with implementations passed via provide
  const [state, send] = useMachine(
    counterMachine.provide({
      actions: {
        increment: assign(({ context }) => ({ 
          count: context.count + 1 
        })),
        decrement: assign(({ context }) => ({ 
          count: context.count - 1 
        })),
        reset: assign(() => ({ 
          count: 0 
        })),
        updateName: assign((_, event) => ({ 
          name: event.value 
        }))
      }
    })
  );
  
  // Extract values from state
  const { count, name } = state.context;

  return (
    <Container>
      <Header>XState V5 Test (Correct Implementation)</Header>
      
      <StateDisplay>
        <h3>Current State: {state.value}</h3>
        <p>Count: {count}</p>
        <p>Name: {name || '(empty)'}</p>
      </StateDisplay>

      <FormGroup>
        <Label>Enter your name:</Label>
        <Input 
          type="text" 
          value={name} 
          onChange={(e) => send({ type: 'UPDATE_NAME', value: e.target.value })} 
        />
      </FormGroup>

      <div>
        <ActionButton onClick={() => send({ type: 'INCREMENT' })}>
          Increment
        </ActionButton>
        
        <ActionButton onClick={() => send({ type: 'DECREMENT' })}>
          Decrement
        </ActionButton>
        
        <ActionButton onClick={() => send({ type: 'RESET' })}>
          Reset
        </ActionButton>
      </div>
    </Container>
  );
}