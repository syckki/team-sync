import React, { useState } from 'react';
import styled from 'styled-components';

const TooltipContainer = styled.div`
  position: relative;
  display: inline-flex;
  margin-left: 0.35rem;
  vertical-align: middle;
  cursor: pointer;
`;

const InfoIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: #4e7fff;
  font-size: 11px;
  font-weight: bold;
  background-color: transparent;
  border: 1px solid #4e7fff;
  
  &:hover {
    background-color: #4e7fff;
    color: white;
  }
`;

const TooltipContent = styled.div`
  position: absolute;
  width: 280px;
  background-color: #ffffff;
  color: #333;
  border-radius: 6px;
  padding: 0.8rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 0.75rem;
  line-height: 1.4;
  z-index: 1000;
  visibility: ${props => (props.$visible ? 'visible' : 'hidden')};
  opacity: ${props => (props.$visible ? 1 : 0)};
  transition: opacity 0.2s;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  
  /* Adjust positioning for mobile */
  @media (max-width: 768px) {
    left: auto;
    right: 0;
    transform: none;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid #ffffff;
    
    /* Adjust arrow positioning for mobile */
    @media (max-width: 768px) {
      left: auto;
      right: 6px;
      transform: none;
    }
  }
`;

const TooltipTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.4rem;
  font-size: 0.8rem;
  color: #4e7fff;
`;

const TooltipParagraph = styled.p`
  margin: 0 0 0.5rem 0;
  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * InfoTooltip component displays a tooltip with information about a field when hovering over the info icon
 * @param {Object} props
 * @param {string} props.title - Title of the tooltip (usually the field name)
 * @param {string} props.content - Explanation text for the tooltip
 * @param {string} [props.actionHint] - Optional hint about what the user can do with this field
 */
const InfoTooltip = ({ title, content, actionHint }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TooltipContainer 
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)} // Toggle on click for mobile
    >
      <InfoIcon>i</InfoIcon>
      <TooltipContent $visible={isVisible}>
        <TooltipTitle>{title}</TooltipTitle>
        <TooltipParagraph>{content}</TooltipParagraph>
        {actionHint && (
          <TooltipParagraph><strong>Tip:</strong> {actionHint}</TooltipParagraph>
        )}
      </TooltipContent>
    </TooltipContainer>
  );
};

export default InfoTooltip;