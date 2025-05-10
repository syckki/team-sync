import React, { useState } from 'react';
import styled from 'styled-components';
import { useReportFormMachine } from '../hooks';

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
  // Mock dependencies for the test
  const mockUpdateReferenceData = async () => {
    console.log('Updating reference data...');
    return true;
  };
  
  // Use our state machine hook
  const {
    state,
    context,
    updateTeamMember,
    updateTeamRole,
    addRow,
    removeRow,
    saveAsDraft,
    submitForm,
    retry,
    isSubmitting,
    error,
    success,
    successMessage,
    rows
  } = useReportFormMachine({
    threadId: 'test-thread',
    keyFragment: 'test-key',
    teamName: 'Test Team',
    updateReferenceData: mockUpdateReferenceData,
    readOnly: false,
    initialReportData: null,
    messageIndex: null
  });

  // Display the current state and context
  return (
    <Container>
      <Header>
        <Title>XState Report Form Machine Test</Title>
      </Header>
      
      <StateBox>
        <StateTitle>Current State: {JSON.stringify(state)}</StateTitle>
        <pre>{JSON.stringify({ rows, error, success, successMessage }, null, 2)}</pre>
      </StateBox>
      
      <FormControl>
        <Label htmlFor="teamMember">Team Member</Label>
        <Input
          id="teamMember"
          value={context.teamMember}
          onChange={(e) => updateTeamMember(e.target.value)}
          placeholder="Enter your name"
        />
      </FormControl>
      
      <FormControl>
        <Label htmlFor="teamRole">Role</Label>
        <Input
          id="teamRole"
          value={context.teamRole}
          onChange={(e) => updateTeamRole(e.target.value)}
          placeholder="Enter your role"
        />
      </FormControl>
      
      <ActionsBox>
        <Button onClick={addRow}>Add Row</Button>
        {rows.length > 0 && (
          <Button onClick={() => removeRow(rows[0].id)}>Remove First Row</Button>
        )}
        <Button onClick={saveAsDraft} disabled={isSubmitting}>Save as Draft</Button>
        <Button onClick={submitForm} disabled={isSubmitting}>Submit</Button>
        {error && <Button onClick={retry}>Retry</Button>}
      </ActionsBox>
      
      {success && (
        <StateBox style={{ backgroundColor: '#d4edda', color: '#155724' }}>
          {successMessage}
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