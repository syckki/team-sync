import React from 'react';
import styled from 'styled-components';

// Card container with common styling
const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: hsl(0, 0%, 100%);
  border-radius: 0.5rem;
  border: 1px solid hsl(0, 0%, 90%);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  
  ${props => props.$noPadding ? '' : `
    ${!props.$noPaddingHeader ? 'padding: 1.25rem;' : ''}
  `}
  
  ${props => props.$fullHeight && `
    height: 100%;
  `}
  
  ${props => props.$clickable && `
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
  `}
`;

// Card header with bottom border
const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.$align || 'space-between'};
  padding: ${props => props.$noPadding ? '0' : '0 0 1rem 0'};
  margin-bottom: ${props => props.$noPadding ? '0' : '1rem'};
  border-bottom: ${props => props.$noBorder ? 'none' : '1px solid hsl(0, 0%, 90%)'};
  
  ${props => props.$compact && `
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
  `}
`;

// Title component with size variants
const CardTitle = styled.h3`
  margin: 0;
  font-size: ${props => {
    switch (props.$size) {
      case 'large': return '1.25rem';
      case 'small': return '0.875rem';
      default: return '1rem';
    }
  }};
  font-weight: ${props => props.$weight || '600'};
  color: hsl(0, 0%, 20%);
  line-height: 1.5;
`;

// Card content area
const CardContent = styled.div`
  flex: 1;
  ${props => props.$padding && `padding: ${props.$padding};`}
`;

// Card footer with top border
const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.$align || 'flex-end'};
  padding: ${props => props.$noPadding ? '0' : '1rem 0 0 0'};
  margin-top: ${props => props.$noPadding ? '0' : '1rem'};
  border-top: ${props => props.$noBorder ? 'none' : '1px solid hsl(0, 0%, 90%)'};
  gap: 0.75rem;
  
  ${props => props.$compact && `
    padding-top: 0.5rem;
    margin-top: 0.5rem;
  `}
`;

/**
 * Card component with header, content, and footer sections
 * 
 * @param {object} props - Card props
 * @param {React.ReactNode} [props.children] - Card content
 * @param {React.ReactNode} [props.title] - Card title
 * @param {React.ReactNode} [props.headerRight] - Content to show on the right side of the header
 * @param {React.ReactNode} [props.footer] - Card footer content
 * @param {string} [props.titleSize='medium'] - Title size ('small', 'medium', 'large')
 * @param {string} [props.titleWeight='600'] - Title font weight 
 * @param {boolean} [props.fullHeight=false] - Whether card should take full height of its container
 * @param {boolean} [props.clickable=false] - Whether card is clickable
 * @param {boolean} [props.noPadding=false] - Whether to remove all padding 
 * @param {boolean} [props.noPaddingHeader=false] - Whether to remove padding from header
 * @param {boolean} [props.compact=false] - Whether to use compact spacing
 * @param {function} [props.onClick] - Click handler for clickable cards
 * @returns {React.ReactElement} - Rendered Card component
 */
const Card = ({
  children,
  title,
  headerRight,
  footer,
  titleSize = 'medium',
  titleWeight = '600',
  fullHeight = false,
  clickable = false,
  noPadding = false,
  noPaddingHeader = false,
  compact = false,
  footerAlign = 'flex-end',
  headerAlign = 'space-between',
  className,
  onClick,
  ...props
}) => {
  
  // Only create header if title or headerRight is provided
  const headerContent = (title || headerRight) && (
    <CardHeader 
      $noPadding={noPadding} 
      $noBorder={!title && !headerRight}
      $compact={compact}
      $align={headerAlign}
    >
      {title && (
        <CardTitle $size={titleSize} $weight={titleWeight}>
          {title}
        </CardTitle>
      )}
      {headerRight}
    </CardHeader>
  );
  
  // Only create footer if footer content is provided
  const footerContent = footer && (
    <CardFooter 
      $noPadding={noPadding} 
      $compact={compact}
      $align={footerAlign}
    >
      {footer}
    </CardFooter>
  );
  
  return (
    <CardContainer 
      $fullHeight={fullHeight}
      $clickable={clickable}
      $noPadding={noPadding}
      $noPaddingHeader={noPaddingHeader}
      onClick={clickable ? onClick : undefined}
      className={className}
      {...props}
    >
      {headerContent}
      <CardContent $padding={noPadding ? '0' : undefined}>
        {children}
      </CardContent>
      {footerContent}
    </CardContainer>
  );
};

export default Card;