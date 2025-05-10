import { useState, useEffect } from 'react';
import { useReportFormMachine } from '../hooks';
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
 * Test component for the XState Report Form Machine
 */
export default function StatelyTest() {
  // Mock props for testing
  const [mockTeamName] = useState('Engineering Team');
  const [mockThreadId] = useState('test-thread-123');
  const [mockKeyFragment] = useState('test-key-fragment');
  
  // Mock reference data update function
  const mockUpdateReferenceData = useCallback(async () => {
    console.log('Updating reference data...');
    return true;
  }, []);
  
  // Creating the form machine
  const reportForm = useReportFormMachine({
    threadId: mockThreadId,
    keyFragment: mockKeyFragment,
    teamName: mockTeamName,
    updateReferenceData: mockUpdateReferenceData,
  });

  // Extract states and actions
  const { 
    state, 
    context, 
    updateTeamMember, 
    updateTeamRole, 
    updateField,
    addRow,
    removeRow,
    toggleRowExpansion,
    saveAsDraft,
    submitForm
  } = reportForm;

  // Display state changes in console for debugging
  useEffect(() => {
    console.log('Current state:', state);
    console.log('Current context:', context);
  }, [state, context]);

  // Helper to stringify state for display
  const getStateName = () => {
    return typeof state.value === 'string' ? state.value : JSON.stringify(state.value);
  };

  return (
    <Container>
      <Header>XState Report Form Machine Test</Header>
      
      <StateDisplay>
        <h3>Current State: {getStateName()}</h3>
        <p>Read Only: {context.isReadOnly ? 'Yes' : 'No'}</p>
        <p>Success: {context.success ? 'Yes' : 'No'}</p>
        <p>Error: {context.error || 'None'}</p>
      </StateDisplay>

      <div>
        <h3>Team Information</h3>
        <FormGroup>
          <Label>Team Member Name:</Label>
          <Input 
            type="text" 
            value={context.teamMember} 
            onChange={(e) => updateTeamMember(e.target.value)} 
            disabled={context.isReadOnly}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Team Role:</Label>
          <Input 
            type="text" 
            value={context.teamRole} 
            onChange={(e) => updateTeamRole(e.target.value)} 
            disabled={context.isReadOnly}
          />
        </FormGroup>
      </div>

      <h3>Productivity Entries ({context.rows.length})</h3>
      {context.rows.map((row, index) => (
        <div key={row.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <p>Row #{index + 1} (ID: {row.id})</p>
          <FormGroup>
            <Label>Platform:</Label>
            <Input 
              type="text" 
              value={row.platform} 
              onChange={(e) => updateField(row.id, 'platform', e.target.value)} 
              disabled={context.isReadOnly}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Project Initiative:</Label>
            <Input 
              type="text" 
              value={row.projectInitiative} 
              onChange={(e) => updateField(row.id, 'projectInitiative', e.target.value)} 
              disabled={context.isReadOnly}
            />
          </FormGroup>
          
          {!context.isReadOnly && (
            <ActionButton onClick={() => removeRow(row.id)}>
              Remove Row
            </ActionButton>
          )}
          
          <ActionButton onClick={() => toggleRowExpansion(row.id)}>
            {context.expandedRows[row.id] ? 'Collapse' : 'Expand'}
          </ActionButton>
        </div>
      ))}

      {!context.isReadOnly && (
        <ActionButton onClick={addRow}>
          Add Row
        </ActionButton>
      )}

      <div style={{ marginTop: '30px' }}>
        <ActionButton onClick={saveAsDraft} disabled={context.isReadOnly}>
          Save as Draft
        </ActionButton>
        
        <ActionButton onClick={submitForm} disabled={context.isReadOnly}>
          Submit Report
        </ActionButton>
      </div>
    </Container>
  );
}