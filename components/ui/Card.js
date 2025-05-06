import React from 'react';
import styled, { css } from 'styled-components';

// Base card styles
const baseCardStyles = css`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

// Card container
const CardContainer = styled.div`
  ${baseCardStyles}
  border: 1px solid ${props => props.$borderColor || '#e2e8f0'};
  display: flex;
  flex-direction: column;
  ${props => props.$padding && `padding: ${props.$padding}`};
  ${props => props.$margin && `margin: ${props.$margin}`};
  ${props => props.$width && `width: ${props.$width}`};
  ${props => props.$height && `height: ${props.$height}`};
  ${props => props.$highlight && css`
    border-left: 4px solid ${props.$highlight};
  `}
`;

// Card header
const CardHeader = styled.div`
  padding: ${props => props.$padding || '1rem'};
  background-color: ${props => props.$background || '#f8fafc'};
  border-bottom: 1px solid ${props => props.$borderColor || '#e2e8f0'};
  display: flex;
  justify-content: ${props => props.$justifyContent || 'space-between'};
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

// Card title
const CardTitle = styled.h3`
  margin: 0;
  font-size: ${props => props.$fontSize || '1rem'};
  font-weight: 600;
  color: #2d3748;
`;

// Card content
const CardContent = styled.div`
  padding: ${props => props.$padding || '1rem'};
  flex: 1;
`;

// Card footer
const CardFooter = styled.div`
  padding: ${props => props.$padding || '1rem'};
  background-color: ${props => props.$background || '#f8fafc'};
  border-top: 1px solid ${props => props.$borderColor || '#e2e8f0'};
  display: flex;
  justify-content: ${props => props.$justifyContent || 'flex-end'};
  align-items: center;
  gap: 0.75rem;
`;

/**
 * Card component with optional header, content, and footer
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.header] - Card header content
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} [props.footer] - Card footer content
 * @param {string} [props.padding] - Custom padding for the card
 * @param {string} [props.margin] - Custom margin for the card
 * @param {string} [props.width] - Custom width for the card
 * @param {string} [props.height] - Custom height for the card
 * @param {string} [props.borderColor] - Custom border color
 * @param {string} [props.highlight] - Highlight color for the left border
 * @param {string} [props.headerPadding] - Custom padding for the header
 * @param {string} [props.contentPadding] - Custom padding for the content
 * @param {string} [props.footerPadding] - Custom padding for the footer
 * @param {string} [props.headerBackground] - Custom background color for the header
 * @param {string} [props.footerBackground] - Custom background color for the footer
 * @param {string} [props.headerJustifyContent] - Custom justify-content for the header
 * @param {string} [props.footerJustifyContent] - Custom justify-content for the footer
 * @param {string} [props.titleFontSize] - Custom font size for the title
 * @returns {React.ReactElement} Styled card component
 */
const Card = ({ 
  header,
  children,
  footer,
  padding,
  margin,
  width,
  height,
  borderColor,
  highlight,
  headerPadding,
  contentPadding,
  footerPadding,
  headerBackground,
  footerBackground,
  headerJustifyContent,
  footerJustifyContent,
  titleFontSize,
  ...rest 
}) => {
  return (
    <CardContainer 
      $padding={padding} 
      $margin={margin}
      $width={width}
      $height={height}
      $borderColor={borderColor}
      $highlight={highlight}
      {...rest}
    >
      {header && (
        typeof header === 'string' ? (
          <CardHeader 
            $padding={headerPadding} 
            $background={headerBackground}
            $borderColor={borderColor}
            $justifyContent={headerJustifyContent}
          >
            <CardTitle $fontSize={titleFontSize}>{header}</CardTitle>
          </CardHeader>
        ) : (
          <CardHeader 
            $padding={headerPadding} 
            $background={headerBackground}
            $borderColor={borderColor}
            $justifyContent={headerJustifyContent}
          >
            {header}
          </CardHeader>
        )
      )}
      <CardContent $padding={contentPadding}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter 
          $padding={footerPadding} 
          $background={footerBackground}
          $borderColor={borderColor}
          $justifyContent={footerJustifyContent}
        >
          {footer}
        </CardFooter>
      )}
    </CardContainer>
  );
};

// Also export the sub-components for more flexible usage
Card.Container = CardContainer;
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;