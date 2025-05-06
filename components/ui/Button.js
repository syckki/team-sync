import React from 'react';
import styled, { css } from 'styled-components';

// Shared styles for all button variants
const baseStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: calc(0.5rem - 2px);
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;

  &:disabled {
    background-color: #cccccc;
    color: rgba(0, 0, 0, 0.4);
    cursor: not-allowed;
  }
`;

// Style variants
const variants = {
  primary: css`
    background-color: hsl(217 91% 60%);
    color: hsl(217 100% 99%);
    
    &:hover:not(:disabled) {
      background-color: #3d6bf3;
    }
  `,
  secondary: css`
    background-color: #f3f4f6;
    color: #4b5563;
    border: 1px solid #d1d5db;
    
    &:hover:not(:disabled) {
      background-color: #e5e7eb;
    }
  `,
  success: css`
    background-color: #4caf50;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #43a047;
    }
  `,
  danger: css`
    background-color: #ef4444;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #dc2626;
    }
  `,
  text: css`
    background-color: transparent;
    color: hsl(217 91% 60%);
    padding: 0.25rem 0.5rem;
    
    &:hover:not(:disabled) {
      background-color: #f3f4f6;
    }
  `,
};

// Size variants
const sizes = {
  small: css`
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  `,
  medium: css`
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  `,
  large: css`
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
  `,
};

const StyledButton = styled.button`
  ${baseStyles}
  ${props => variants[props.$variant || 'primary']}
  ${props => sizes[props.$size || 'medium']}
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
`;

/**
 * Button component with several variants
 * 
 * @param {Object} props - Component props
 * @param {string} [props.variant='primary'] - Button variant (primary, secondary, success, danger, text)
 * @param {string} [props.size='medium'] - Button size (small, medium, large)
 * @param {boolean} [props.fullWidth=false] - Whether the button should take full width
 * @param {React.ReactNode} props.children - Button content
 * @param {React.ButtonHTMLAttributes} props.rest - Additional button attributes
 * @returns {React.ReactElement} Styled button component
 */
const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false, 
  children, 
  ...rest 
}) => {
  return (
    <StyledButton 
      $variant={variant} 
      $size={size} 
      $fullWidth={fullWidth} 
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

export default Button;