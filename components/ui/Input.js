import React from 'react';
import styled, { css } from 'styled-components';

// Base input styles
const baseInputStyles = css`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(20 5.9% 90%);
  border-radius: calc(0.5rem - 2px);
  font-size: 0.875rem;
  line-height: 1.25rem;
  background-color: ${props => props.$hasValue ? '#fff' : '#f8f9fa'};
  transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #4e7fff;
    background-color: #fff;
    box-shadow: 0 0 0 2px rgba(78, 127, 255, 0.1);
  }

  &:read-only {
    background-color: rgb(243 244 246);
    cursor: not-allowed;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background-color: #f8f9fa;
  }
`;

// Styled input component
const StyledInput = styled.input`
  ${baseInputStyles}
  height: ${props => props.$size === 'large' ? '2.5rem' : '2.25rem'};
`;

// Text area component that shares the same base styles
const StyledTextArea = styled.textarea`
  ${baseInputStyles}
  resize: ${props => props.$resize || 'vertical'};
  min-height: ${props => props.$minHeight || '5rem'};
  font-family: inherit;
`;

// Input wrapper with optional label
const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${props => props.$noMargin ? '0' : '1rem'};
  width: 100%;
`;

// Label component
const Label = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: hsl(20 14.3% 4.1%);
  font-size: 0.875rem;
  line-height: 1;
`;

// Required indicator
const RequiredIndicator = styled.span`
  color: #e53e3e;
  margin-left: 0.25rem;
`;

// Error message styling
const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

/**
 * Input component with consistent styling
 * 
 * @param {Object} props - Component props
 * @param {string} [props.type='text'] - Input type
 * @param {string} [props.label] - Input label
 * @param {boolean} [props.required=false] - Whether the input is required
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.noMargin=false] - Whether to remove bottom margin
 * @param {string} [props.size='medium'] - Input size (medium, large)
 * @param {React.InputHTMLAttributes} props.rest - Additional input attributes
 * @returns {React.ReactElement} Styled input component
 */
export const Input = ({ 
  type = 'text', 
  label, 
  required = false,
  error,
  noMargin = false,
  size = 'medium',
  ...rest 
}) => {
  return (
    <InputWrapper $noMargin={noMargin}>
      {label && (
        <Label htmlFor={rest.id || rest.name}>
          {label}
          {required && <RequiredIndicator>*</RequiredIndicator>}
        </Label>
      )}
      <StyledInput 
        type={type} 
        $hasValue={!!rest.value} 
        $size={size}
        required={required}
        {...rest} 
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};

/**
 * TextArea component with consistent styling
 * 
 * @param {Object} props - Component props
 * @param {string} [props.label] - TextArea label
 * @param {boolean} [props.required=false] - Whether the textarea is required
 * @param {string} [props.error] - Error message
 * @param {string} [props.resize='vertical'] - Resize behavior (none, vertical, horizontal, both)
 * @param {string} [props.minHeight='5rem'] - Minimum height of the textarea
 * @param {boolean} [props.noMargin=false] - Whether to remove bottom margin
 * @param {React.TextareaHTMLAttributes} props.rest - Additional textarea attributes
 * @returns {React.ReactElement} Styled textarea component
 */
export const TextArea = ({ 
  label, 
  required = false,
  error,
  resize = 'vertical',
  minHeight = '5rem',
  noMargin = false,
  ...rest 
}) => {
  return (
    <InputWrapper $noMargin={noMargin}>
      {label && (
        <Label htmlFor={rest.id || rest.name}>
          {label}
          {required && <RequiredIndicator>*</RequiredIndicator>}
        </Label>
      )}
      <StyledTextArea 
        $hasValue={!!rest.value} 
        $resize={resize}
        $minHeight={minHeight}
        required={required}
        {...rest} 
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};

/**
 * ReadOnly field styling for consistent display of non-editable values
 */
export const ReadOnlyField = styled.div`
  width: 100%;
  padding: 0.5rem 0.75rem;
  background-color: rgb(243 244 246);
  border: 1px solid hsl(20 5.9% 90%);
  border-radius: calc(0.5rem - 2px);
  font-size: 0.875rem;
  line-height: 1.25rem;
  cursor: not-allowed;
  color: #4b5563;
  min-height: 2.25rem;
  display: flex;
  align-items: center;
  white-space: ${props => props.$autoWrap ? 'normal' : 'nowrap'};
  overflow: ${props => props.$autoWrap ? 'visible' : 'hidden'};
  text-overflow: ${props => props.$autoWrap ? 'clip' : 'ellipsis'};

  &.empty::after {
    content: attr(data-placeholder);
    color: #9ca3af;
  }
`;

// Export components
export default Input;