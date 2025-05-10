import { useState } from 'react';
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
 * Extremely simple counter without XState, to verify React is working properly
 */
export default function SimplestCounter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  return (
    <Container>
      <Header>Simple React Counter (No XState)</Header>
      
      <StateDisplay>
        <h3>Current Count: {count}</h3>
        <p>Name: {name || '(empty)'}</p>
      </StateDisplay>

      <FormGroup>
        <Label>Enter your name:</Label>
        <Input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
      </FormGroup>

      <div>
        <ActionButton onClick={() => setCount(count + 1)}>
          Increment
        </ActionButton>
        
        <ActionButton onClick={() => setCount(count - 1)}>
          Decrement
        </ActionButton>
        
        <ActionButton onClick={() => setCount(0)}>
          Reset
        </ActionButton>
      </div>
    </Container>
  );
}