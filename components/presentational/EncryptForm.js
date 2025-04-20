import { useState } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  background-color: ${({ theme }) => theme.colors.errorBg};
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const EncryptForm = ({ onSubmit, isLoading, error, isReply = false }) => {
  const [formValues, setFormValues] = useState({
    threadTitle: '',
    title: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  const isFormValid = formValues.title.trim() && formValues.message.trim() && 
    (isReply || formValues.threadTitle.trim());

  return (
    <Form onSubmit={handleSubmit}>
      <Title>{isReply ? 'Send Encrypted Reply' : 'Create Encrypted Message'}</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {!isReply && (
        <FormGroup>
          <Label htmlFor="threadTitle">Thread Title</Label>
          <Input
            type="text"
            id="threadTitle"
            name="threadTitle"
            value={formValues.threadTitle}
            onChange={handleChange}
            placeholder="Enter a title for this thread"
            required={!isReply}
          />
        </FormGroup>
      )}
      
      <FormGroup>
        <Label htmlFor="title">Message Title</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formValues.title}
          onChange={handleChange}
          placeholder={isReply ? "Reply: Enter a title" : "Enter a title for your message"}
          required
        />
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="message">Message</Label>
        <TextArea
          id="message"
          name="message"
          value={formValues.message}
          onChange={handleChange}
          placeholder={isReply ? "Type your secure reply here..." : "Enter your confidential message here"}
          required
        />
      </FormGroup>
      
      <Button type="submit" disabled={isLoading || !isFormValid}>
        {isLoading ? 'Encrypting...' : (isReply ? 'Encrypt & Send Reply' : 'Encrypt & Create Secure Link')}
      </Button>
    </Form>
  );
};

export default EncryptForm;
