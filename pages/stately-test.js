import React, { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';

// Define a simple state machine for testing
const testMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgBsB7KAehygEUAlAYQGVYwAXdYAL02kAD0QBGADQgAnsnEBmAKwA2AOxKF8zbNWKl68bMUB2RQBoQAT0TjVNvfpnrNygowIaATKoPGnAGhAAvoBeuorOFtQqoS5mClY2BkbxBkEAJvHO5mQRIdSycpaUcgqw-MZmCOZUtgmpiWYKxsb2JZW2FdWIALQgTcFi6JgERPSIGAyBfkHIoZGKxrFR1IkkNoiG9gQhSnhO+T0Kxbl56XlFJRTlxpbVdbGNiIhDK8NoYxOTKGgYKw0IG0+mMBwGeCQ7l8Q38fkORw0sRSaROpz0KRKvgogiuY2uthm8xsADVXt9YH9AcDFMC3uC3j8BK5Dm5lPN4LjlHZCC4tphERZ8QsiXR7BYiYYTDC8TCEXYodCYcY4XijGiJB5JCxjGj9Fp9MZiLTkDICYYyagGVZLBaFELBdE1Gj5e8FYqSa8ld85iRHm8Pj9nGLUbNNEs0QQAA */
  id: 'testMachine',
  initial: 'idle',
  context: {
    teamMember: '',
    teamRole: '',
    count: 0,
    error: null,
    success: false,
    message: ''
  },
  states: {
    idle: {
      on: {
        START: 'loading'
      }
    },
    loading: {
      on: {
        LOADED: 'editing',
        ERROR: 'error'
      }
    },
    editing: {
      on: {
        SAVE: 'saving',
        SUBMIT: 'submitting',
        INCREMENT: {
          actions: ({ context }) => {
            context.count += 1;
          }
        },
        UPDATE_MEMBER: {
          actions: ({ context, event }) => {
            context.teamMember = event.value;
          }
        },
        UPDATE_ROLE: {
          actions: ({ context, event }) => {
            context.teamRole = event.value;
          }
        }
      }
    },
    saving: {
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
      entry: ({ context }) => {
        context.success = true;
        context.message = 'Operation completed successfully!';
      },
      after: {
        3000: 'editing'
      }
    },
    error: {
      entry: ({ context }) => {
        context.error = 'Something went wrong';
      },
      on: {
        RETRY: 'editing'
      }
    }
  }
});

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const Header = styled.header`
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #333;
  font-size: 24px;
`;

const StateBox = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 5px;
  border: 1px solid #ddd;
`;

const StateTitle = styled.h2`
  color: #555;
  font-size: 18px;
  margin-bottom: 10px;
`;

const ActionsBox = styled.div`
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 10px 15px;
  margin-right: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #3367d6;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const FormControl = styled.div`
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

const StatelyTest = () => {
  // Use XState machine
  const [state, send] = useMachine(testMachine);
  
  // Start the machine on mount (will run once when component renders)
  React.useEffect(() => {
    send('START');
    
    // Simulate loading completion
    setTimeout(() => {
      send('LOADED');
    }, 1000);
  }, []);
  
  // Get current context
  const { teamMember, teamRole, count, error, success, message } = state.context;
  
  // Get current state
  const currentState = state.value;
  const isSubmitting = currentState === 'submitting' || currentState === 'saving';
  
  // Display the current state and context
  return (
    <Container>
      <Header>
        <Title>XState Simple Test Machine</Title>
      </Header>
      
      <StateBox>
        <StateTitle>Current State: {currentState}</StateTitle>
        <div>Count: {count}</div>
      </StateBox>
      
      <FormControl>
        <Label htmlFor="teamMember">Team Member</Label>
        <Input
          id="teamMember"
          value={teamMember}
          onChange={(e) => send({ type: 'UPDATE_MEMBER', value: e.target.value })}
          placeholder="Enter your name"
        />
      </FormControl>
      
      <FormControl>
        <Label htmlFor="teamRole">Role</Label>
        <Input
          id="teamRole"
          value={teamRole}
          onChange={(e) => send({ type: 'UPDATE_ROLE', value: e.target.value })}
          placeholder="Enter your role"
        />
      </FormControl>
      
      <ActionsBox>
        <Button onClick={() => send('INCREMENT')}>Increment Count</Button>
        <Button onClick={() => send('SAVE')} disabled={isSubmitting}>Save</Button>
        <Button onClick={() => send('SUBMIT')} disabled={isSubmitting}>Submit</Button>
        {currentState === 'error' && <Button onClick={() => send('RETRY')}>Retry</Button>}
      </ActionsBox>
      
      {currentState === 'saving' && (
        <StateBox style={{ backgroundColor: '#cce5ff', color: '#004085' }}>
          Saving your data...
          <Button onClick={() => send('SAVE_SUCCESS')}>Simulate Success</Button>
          <Button onClick={() => send('SAVE_ERROR')}>Simulate Error</Button>
        </StateBox>
      )}
      
      {currentState === 'submitting' && (
        <StateBox style={{ backgroundColor: '#cce5ff', color: '#004085' }}>
          Submitting your data...
          <Button onClick={() => send('SUBMIT_SUCCESS')}>Simulate Success</Button>
          <Button onClick={() => send('SUBMIT_ERROR')}>Simulate Error</Button>
        </StateBox>
      )}
      
      {success && (
        <StateBox style={{ backgroundColor: '#d4edda', color: '#155724' }}>
          {message}
        </StateBox>
      )}
      
      {error && (
        <StateBox style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
          Error: {error}
        </StateBox>
      )}
    </Container>
  );
};

export default StatelyTest;