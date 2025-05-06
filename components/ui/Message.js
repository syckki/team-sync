import React from 'react';
import styled, { css } from 'styled-components';

// Message variants
const variants = {
  error: css`
    background-color: hsl(354, 100%, 97%);
    color: hsl(354, 70%, 54%);
    border-left-color: hsl(354, 70%, 54%);
  `,
  success: css`
    background-color: hsl(134, 100%, 97%);
    color: hsl(134, 61%, 41%);
    border-left-color: hsl(134, 61%, 41%);
  `,
  warning: css`
    background-color: hsl(45, 100%, 96%);
    color: hsl(45, 97%, 50%);
    border-left-color: hsl(45, 97%, 50%);
  `,
  info: css`
    background-color: hsl(217, 100%, 97%);
    color: hsl(217, 91%, 60%);
    border-left-color: hsl(217, 91%, 60%);
  `,
};

// Message sizes
const sizes = {
  small: css`
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  `,
  medium: css`
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
  `,
  large: css`
    font-size: 1rem;
    padding: 1rem 1.25rem;
  `,
};

const StyledMessage = styled.div`
  display: flex;
  align-items: center;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  border-left: 4px solid;
  
  /* Apply variants */
  ${props => variants[props.$variant || 'info']}
  
  /* Apply sizes */
  ${props => sizes[props.$size || 'medium']}
  
  /* Full width option */
  ${props => props.$fullWidth && css`
    width: 100%;
  `}
  
  /* Handle icon spacing */
  ${props => props.$hasIcon && css`
    .message-icon {
      margin-right: 0.75rem;
    }
  `}
`;

const MessageContent = styled.div`
  flex: 1;
`;

const MessageTitle = styled.div`
  font-weight: 600;
  margin-bottom: ${props => props.$hasContent ? '0.5rem' : '0'};
`;

/**
 * Message component for displaying notifications, errors, etc.
 * 
 * @param {object} props - Message props
 * @param {string} [props.variant='info'] - Message variant ('error', 'success', 'warning', 'info')
 * @param {string} [props.size='medium'] - Message size ('small', 'medium', 'large')
 * @param {boolean} [props.fullWidth=false] - Whether message should take full width of its container
 * @param {string} [props.title] - Optional message title
 * @param {React.ReactNode} [props.icon] - Optional icon to display before message
 * @param {React.ReactNode} [props.children] - Message content
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} - Rendered Message component
 */
const Message = ({ 
  variant = 'info',
  size = 'medium',
  fullWidth = false,
  title,
  icon,
  children,
  className,
  ...restProps
}) => {
  const hasIcon = !!icon;
  const hasContent = !!children;
  
  return (
    <StyledMessage
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $hasIcon={hasIcon}
      className={className}
      {...restProps}
    >
      {hasIcon && <div className="message-icon">{icon}</div>}
      <MessageContent>
        {title && <MessageTitle $hasContent={hasContent}>{title}</MessageTitle>}
        {children}
      </MessageContent>
    </StyledMessage>
  );
};

/**
 * ErrorMessage - Shorthand for Message with error variant
 */
const ErrorMessage = (props) => (
  <Message variant="error" {...props} />
);

/**
 * SuccessMessage - Shorthand for Message with success variant
 */
const SuccessMessage = (props) => (
  <Message variant="success" {...props} />
);

/**
 * WarningMessage - Shorthand for Message with warning variant
 */
const WarningMessage = (props) => (
  <Message variant="warning" {...props} />
);

/**
 * InfoMessage - Shorthand for Message with info variant
 */
const InfoMessage = (props) => (
  <Message variant="info" {...props} />
);

export { ErrorMessage, SuccessMessage, WarningMessage, InfoMessage };
export default Message;