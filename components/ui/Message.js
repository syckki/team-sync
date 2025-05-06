import React from 'react';
import styled, { css } from 'styled-components';

// Message types and their style configurations
const messageTypes = {
  error: {
    backgroundColor: '#fff5f5',
    borderColor: '#fed7d7',
    textColor: '#e53e3e',
    iconColor: '#e53e3e',
  },
  success: {
    backgroundColor: '#f0fff4',
    borderColor: '#c6f6d5',
    textColor: '#38a169',
    iconColor: '#38a169',
  },
  warning: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    textColor: '#856404',
    iconColor: '#856404',
  },
  info: {
    backgroundColor: '#cce5ff',
    borderColor: '#b8daff',
    textColor: '#004085',
    iconColor: '#004085',
  },
};

// Base message styles
const baseMessageStyles = css`
  padding: 0.75rem;
  margin-bottom: ${props => props.$noMargin ? '0' : '1rem'};
  border-radius: 4px;
  display: flex;
  align-items: ${props => props.$alignItems || 'flex-start'};
  ${props => props.$leftBorder && css`
    border-left: 4px solid ${messageTypes[props.$type].borderColor};
  `}
`;

// Message container
const MessageContainer = styled.div`
  ${baseMessageStyles}
  background-color: ${props => messageTypes[props.$type].backgroundColor};
  color: ${props => messageTypes[props.$type].textColor};
  border: 1px solid ${props => messageTypes[props.$type].borderColor};
  ${props => props.$fullWidth && 'width: 100%;'}
`;

// Icon container
const IconContainer = styled.div`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  color: ${props => messageTypes[props.$type].iconColor};

  & svg {
    width: 1rem;
    height: 1rem;
  }
`;

// Content container
const Content = styled.div`
  flex: 1;
`;

// Default icons for each message type
const icons = {
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
};

/**
 * Message component for displaying status messages and alerts
 * 
 * @param {Object} props - Component props
 * @param {string} [props.type='info'] - Message type (error, success, warning, info)
 * @param {React.ReactNode} props.children - Message content
 * @param {React.ReactNode} [props.icon] - Custom icon to display
 * @param {boolean} [props.showIcon=true] - Whether to show an icon
 * @param {boolean} [props.noMargin=false] - Whether to remove bottom margin
 * @param {boolean} [props.leftBorder=false] - Whether to show a left border
 * @param {boolean} [props.fullWidth=false] - Whether the message should take full width
 * @param {string} [props.alignItems='flex-start'] - Alignment of the icon and content
 * @returns {React.ReactElement} Styled message component
 */
const Message = ({ 
  type = 'info', 
  children, 
  icon,
  showIcon = true, 
  noMargin = false,
  leftBorder = false,
  fullWidth = false,
  alignItems = 'flex-start',
  ...rest 
}) => {
  // Make sure we have a valid type
  const validType = Object.keys(messageTypes).includes(type) ? type : 'info';
  
  return (
    <MessageContainer 
      $type={validType} 
      $noMargin={noMargin}
      $leftBorder={leftBorder}
      $fullWidth={fullWidth}
      $alignItems={alignItems}
      {...rest}
    >
      {showIcon && (
        <IconContainer $type={validType}>
          {icon || icons[validType]}
        </IconContainer>
      )}
      <Content>{children}</Content>
    </MessageContainer>
  );
};

// Also export simple versions for common use cases
export const ErrorMessage = (props) => <Message type="error" {...props} />;
export const SuccessMessage = (props) => <Message type="success" {...props} />;
export const WarningMessage = (props) => <Message type="warning" {...props} />;
export const InfoMessage = (props) => <Message type="info" {...props} />;

export default Message;