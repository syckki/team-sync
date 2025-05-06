import React from 'react';
import styled, { css } from 'styled-components';

// Button variants
const variants = {
  primary: css`
    background-color: hsl(217, 91%, 60%);
    color: hsl(217, 100%, 99%);
    &:hover {
      background-color: hsl(217, 91%, 55%);
    }
  `,
  secondary: css`
    background-color: hsl(0, 0%, 87%);
    color: hsl(0, 0%, 20%);
    &:hover {
      background-color: hsl(0, 0%, 82%);
    }
  `,
  success: css`
    background-color: hsl(142, 69%, 45%);
    color: hsl(0, 0%, 100%);
    &:hover {
      background-color: hsl(142, 69%, 40%);
    }
  `,
  danger: css`
    background-color: hsl(354, 70%, 54%);
    color: hsl(0, 0%, 100%);
    &:hover {
      background-color: hsl(354, 70%, 49%);
    }
  `,
  text: css`
    background-color: transparent;
    color: hsl(217, 91%, 60%);
    padding: 0;
    &:hover {
      color: hsl(217, 91%, 55%);
      background-color: transparent;
      text-decoration: underline;
    }
  `
};

// Button sizes
const sizes = {
  small: css`
    font-size: 0.75rem;
    line-height: 1rem;
    padding: 0.375rem 0.75rem;
  `,
  medium: css`
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding: 0.5rem 1rem;
  `,
  large: css`
    font-size: 1rem;
    line-height: 1.5rem;
    padding: 0.625rem 1.25rem;
  `,
};

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: calc(0.5rem - 2px);
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
  
  /* Apply variants */
  ${props => variants[props.$variant || 'primary']}
  
  /* Apply sizes */
  ${props => sizes[props.$size || 'medium']}
  
  /* Full width option */
  ${props => props.$fullWidth && css`
    width: 100%;
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    &:hover {
      /* Override any hover styles when disabled */
      ${props => variants[props.$variant || 'primary']}
      opacity: 0.6;
    }
  }

  /* Focus state */
  &:focus {
    outline: 2px solid hsl(217, 91%, 60%, 0.3);
    outline-offset: 2px;
  }

  /* Active state */
  &:active {
    transform: scale(0.98);
  }
`;

/**
 * Button component with various styles and sizes
 * 
 * @param {object} props - Button props
 * @param {string} [props.variant='primary'] - Button style variant ('primary', 'secondary', 'success', 'danger', 'text')
 * @param {string} [props.size='medium'] - Button size ('small', 'medium', 'large')
 * @param {boolean} [props.fullWidth=false] - Whether button should take full width of its container
 * @param {boolean} [props.disabled=false] - Whether button is disabled
 * @param {React.ReactNode} [props.children] - Button content
 * @param {function} [props.onClick] - Click handler
 * @param {string} [props.type='button'] - Button type ('button', 'submit', 'reset')
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} - Rendered Button component
 */
const Button = ({ 
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  type = 'button',
  children,
  onClick,
  className,
  ...restProps
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={className}
      {...restProps}
    >
      {children}
    </StyledButton>
  );
};

export default Button;