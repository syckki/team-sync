import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

// Shared styles for all input types
const inputStyles = css`
  width: 100%;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: hsl(0, 0%, 20%);
  background-color: hsl(0, 0%, 100%);
  border: 1px solid hsl(0, 0%, 80%);
  border-radius: 0.375rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  
  &:focus {
    border-color: hsl(217, 91%, 60%);
    outline: 0;
    box-shadow: 0 0 0 3px hsla(217, 91%, 60%, 0.25);
  }
  
  &:disabled, &[readonly] {
    background-color: hsl(0, 0%, 97%);
    opacity: 1;
  }
  
  &::placeholder {
    color: hsl(0, 0%, 60%);
    opacity: 1;
  }
  
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  /* Firefox */
  &[type=number] {
    -moz-appearance: textfield;
  }
  
  /* Reset browser autocomplete styles */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-text-fill-color: hsl(0, 0%, 20%);
    transition: background-color 5000s ease-in-out 0s;
  }
`;

// Input container for layout and label positioning
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${props => props.$noMargin ? '0' : '1rem'};
  width: 100%;
`;

// Styled label for inputs
const Label = styled.label`
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(0, 0%, 25%);
`;

// Basic input component
const StyledInput = styled.input`
  ${inputStyles}
  height: 2.5rem;
`;

// Textarea component
const StyledTextArea = styled.textarea`
  ${inputStyles}
  min-height: 5rem;
  resize: vertical;
`;

// Read-only field
const StyledReadOnlyField = styled.div`
  ${inputStyles}
  cursor: default;
  min-height: ${props => props.$multiline ? '5rem' : '2.5rem'};
  white-space: ${props => props.$multiline ? 'pre-wrap' : 'nowrap'};
  overflow: hidden;
  text-overflow: ellipsis;
  display: ${props => props.$multiline ? 'block' : 'flex'};
  align-items: ${props => props.$multiline ? 'initial' : 'center'};
`;

/**
 * Input component for text entry
 * 
 * @param {object} props - Input props
 * @param {string} [props.label] - Label for the input
 * @param {string} [props.id] - Input id (auto-generated if not provided)
 * @param {boolean} [props.noMargin=false] - Whether to remove bottom margin
 * @param {string} [props.type='text'] - Input type
 * @param {boolean} [props.required=false] - Whether input is required
 * @param {boolean} [props.disabled=false] - Whether input is disabled
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.value] - Input value
 * @param {function} [props.onChange] - Change handler
 * @returns {React.ReactElement} - Rendered Input component
 */
const Input = forwardRef(({
  label,
  id,
  noMargin = false,
  className,
  ...props
}, ref) => {
  // Generate a unique ID if one is not provided
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <InputContainer $noMargin={noMargin} className={className}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <StyledInput id={inputId} ref={ref} {...props} />
    </InputContainer>
  );
});

Input.displayName = 'Input';

/**
 * TextArea component for multiline text entry
 * 
 * @param {object} props - TextArea props
 * @param {string} [props.label] - Label for the textarea
 * @param {string} [props.id] - TextArea id (auto-generated if not provided)
 * @param {boolean} [props.noMargin=false] - Whether to remove bottom margin
 * @param {boolean} [props.required=false] - Whether textarea is required
 * @param {boolean} [props.disabled=false] - Whether textarea is disabled
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.value] - TextArea value
 * @param {function} [props.onChange] - Change handler
 * @returns {React.ReactElement} - Rendered TextArea component
 */
const TextArea = forwardRef(({
  label,
  id,
  noMargin = false,
  className,
  ...props
}, ref) => {
  // Generate a unique ID if one is not provided
  const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <InputContainer $noMargin={noMargin} className={className}>
      {label && <Label htmlFor={textareaId}>{label}</Label>}
      <StyledTextArea id={textareaId} ref={ref} {...props} />
    </InputContainer>
  );
});

TextArea.displayName = 'TextArea';

/**
 * ReadOnlyField component for displaying read-only data
 * 
 * @param {object} props - ReadOnlyField props
 * @param {string} [props.label] - Label for the field
 * @param {boolean} [props.multiline=false] - Whether field should support multiple lines
 * @param {string} [props.id] - Field id (auto-generated if not provided)
 * @param {boolean} [props.noMargin=false] - Whether to remove bottom margin
 * @param {React.ReactNode} [props.children] - Field content
 * @returns {React.ReactElement} - Rendered ReadOnlyField component
 */
const ReadOnlyField = ({
  label,
  multiline = false,
  id,
  noMargin = false,
  children,
  className,
  ...props
}) => {
  // Generate a unique ID if one is not provided
  const fieldId = id || `field-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <InputContainer $noMargin={noMargin} className={className}>
      {label && <Label htmlFor={fieldId}>{label}</Label>}
      <StyledReadOnlyField
        id={fieldId}
        $multiline={multiline}
        tabIndex={0}
        readOnly
        {...props}
      >
        {children}
      </StyledReadOnlyField>
    </InputContainer>
  );
};

export { TextArea, ReadOnlyField };
export default Input;