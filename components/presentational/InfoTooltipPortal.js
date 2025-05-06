import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

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
  letter-spacing: normal;
  text-transform: none;
  
  &:hover {
    background-color: #4e7fff;
    color: white;
  }
`;

const TooltipContent = styled.div`
  position: fixed;
  width: 280px;
  background-color: #ffffff;
  color: #333;
  border-radius: 6px;
  padding: 0.8rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 0.75rem;
  line-height: 1.4;
  opacity: ${props => (props.$visible ? 1 : 0)};
  transition: opacity 0.2s ease;
  max-height: 300px;
  overflow-y: auto; /* Allow scrolling for very long content */
  letter-spacing: normal;
  text-transform: none;
  pointer-events: ${props => (props.$visible ? "auto" : "none")};
`;

const TooltipArrow = styled.div`
  position: fixed;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #ffffff;
  pointer-events: none;
  opacity: ${props => (props.$visible ? 1 : 0)};
  transition: opacity 0.2s ease;
  
  ${props => props.$position === 'top' && `
    transform: rotate(180deg);
  `}
  
  ${props => props.$position === 'right' && `
    transform: rotate(90deg);
  `}
  
  ${props => props.$position === 'left' && `
    transform: rotate(270deg);
  `}
`;

const TooltipTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.4rem;
  font-size: 0.8rem;
  color: #4e7fff;
  letter-spacing: normal;
  text-transform: none;
`;

const TooltipParagraph = styled.p`
  margin: 0 0 0.5rem 0;
  letter-spacing: normal;
  text-transform: none;
  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * This helper component creates a Portal for tooltips
 */
const TooltipPortal = ({ children, isVisible }) => {
  // Only create the portal if the tooltip is visible
  if (!isVisible) return null;

  // Use createPortal to render the tooltip at the end of the document body
  return typeof document !== 'undefined' 
    ? createPortal(children, document.body) 
    : null;
};

/**
 * InfoTooltip component displays a tooltip with information about a field when hovering over the info icon
 * Uses React Portal to render the tooltip outside of the DOM hierarchy for better positioning
 * 
 * @param {Object} props
 * @param {string} props.title - Title of the tooltip (usually the field name)
 * @param {string} props.content - Explanation text for the tooltip
 * @param {string} [props.actionHint] - Optional hint about what the user can do with this field
 * @param {string} [props.position] - Preferred position ('top', 'bottom', 'left', 'right'). Default is auto-detect.
 */
const InfoTooltipPortal = ({ title, content, actionHint, position = "auto" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState("top");
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [arrowStyle, setArrowStyle] = useState({});
  
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const arrowRef = useRef(null);
  
  // Calculate tooltip position based on available space and container position
  const calculatePosition = () => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipWidth = 280; // Fixed width from styling
    
    // Get tooltip height if available, otherwise estimate
    const tooltipHeight = tooltipRef.current 
      ? Math.min(tooltipRef.current.scrollHeight, 300)
      : 150; // Fallback height estimate
    
    // Available space in each direction
    const spaceAbove = containerRect.top;
    const spaceBelow = window.innerHeight - containerRect.bottom;
    const spaceLeft = containerRect.left;
    const spaceRight = window.innerWidth - containerRect.right;
    
    // Minimum space needed with padding
    const minSpaceNeeded = 10;
    
    // Determine best position - always prefer top position to avoid being hidden by dropdowns
    let bestPosition = position !== "auto" ? position : "top";
    if (position === "auto") {
      // Auto-detect best position, prioritizing 'top' if there's enough space
      if (spaceAbove >= tooltipHeight + minSpaceNeeded) {
        bestPosition = "top";
      } else if (spaceBelow >= tooltipHeight + minSpaceNeeded) {
        bestPosition = "bottom";
      } else if (spaceRight >= tooltipWidth + minSpaceNeeded) {
        bestPosition = "right";
      } else if (spaceLeft >= tooltipWidth + minSpaceNeeded) {
        bestPosition = "left";
      }
    }
    
    // Calculate specific coordinates based on chosen position
    let tooltipStyles = {};
    let arrowStyles = {};
    
    switch (bestPosition) {
      case "bottom":
        // Position below the icon
        tooltipStyles = {
          top: `${containerRect.bottom + 8}px`, 
          left: `${containerRect.left - (tooltipWidth / 2) + (containerRect.width / 2)}px`
        };
        
        arrowStyles = {
          top: `${containerRect.bottom + 2}px`,
          left: `${containerRect.left + (containerRect.width / 2)}px`,
          marginLeft: "-6px",
        };
        
        // Adjust if tooltip goes off-screen
        if (containerRect.left - (tooltipWidth / 2) + (containerRect.width / 2) < minSpaceNeeded) {
          // Too far left, align with left edge
          tooltipStyles.left = `${minSpaceNeeded}px`;
        } else if (containerRect.left - (tooltipWidth / 2) + (containerRect.width / 2) + tooltipWidth > window.innerWidth - minSpaceNeeded) {
          // Too far right, align with right edge
          tooltipStyles.left = `${window.innerWidth - tooltipWidth - minSpaceNeeded}px`;
        }
        break;
        
      case "top":
        // Position above the icon
        tooltipStyles = {
          bottom: `${window.innerHeight - containerRect.top + 8}px`,
          left: `${containerRect.left - (tooltipWidth / 2) + (containerRect.width / 2)}px`
        };
        
        arrowStyles = {
          bottom: `${window.innerHeight - containerRect.top + 2}px`,
          left: `${containerRect.left + (containerRect.width / 2)}px`,
          marginLeft: "-6px",
        };
        
        // Adjust if tooltip goes off-screen (similar logic to bottom)
        if (containerRect.left - (tooltipWidth / 2) + (containerRect.width / 2) < minSpaceNeeded) {
          tooltipStyles.left = `${minSpaceNeeded}px`;
        } else if (containerRect.left - (tooltipWidth / 2) + (containerRect.width / 2) + tooltipWidth > window.innerWidth - minSpaceNeeded) {
          tooltipStyles.left = `${window.innerWidth - tooltipWidth - minSpaceNeeded}px`;
        }
        break;
        
      case "right":
        // Position to the right of the icon
        tooltipStyles = {
          top: `${containerRect.top - (tooltipHeight / 2) + (containerRect.height / 2)}px`,
          left: `${containerRect.right + 8}px`
        };
        
        arrowStyles = {
          top: `${containerRect.top + (containerRect.height / 2)}px`,
          left: `${containerRect.right + 2}px`,
          marginTop: "-6px",
        };
        
        // Adjust if tooltip goes off-screen
        if (containerRect.top - (tooltipHeight / 2) + (containerRect.height / 2) < minSpaceNeeded) {
          tooltipStyles.top = `${minSpaceNeeded}px`;
        } else if (containerRect.top - (tooltipHeight / 2) + (containerRect.height / 2) + tooltipHeight > window.innerHeight - minSpaceNeeded) {
          tooltipStyles.top = `${window.innerHeight - tooltipHeight - minSpaceNeeded}px`;
        }
        break;
        
      case "left":
        // Position to the left of the icon
        tooltipStyles = {
          top: `${containerRect.top - (tooltipHeight / 2) + (containerRect.height / 2)}px`,
          right: `${window.innerWidth - containerRect.left + 8}px`
        };
        
        arrowStyles = {
          top: `${containerRect.top + (containerRect.height / 2)}px`,
          right: `${window.innerWidth - containerRect.left + 2}px`,
          marginTop: "-6px",
        };
        
        // Adjust if tooltip goes off-screen (similar logic to right)
        if (containerRect.top - (tooltipHeight / 2) + (containerRect.height / 2) < minSpaceNeeded) {
          tooltipStyles.top = `${minSpaceNeeded}px`;
        } else if (containerRect.top - (tooltipHeight / 2) + (containerRect.height / 2) + tooltipHeight > window.innerHeight - minSpaceNeeded) {
          tooltipStyles.top = `${window.innerHeight - tooltipHeight - minSpaceNeeded}px`;
        }
        break;
    }
    
    setTooltipPosition(bestPosition);
    setTooltipStyle(tooltipStyles);
    setArrowStyle(arrowStyles);
  };
  
  // Handler for mouse enter
  const handleMouseEnter = () => {
    setIsVisible(true);
  };
  
  // Handler for mouse leave
  const handleMouseLeave = () => {
    setIsVisible(false);
  };
  
  // Handler for click (useful for mobile)
  const handleClick = () => {
    setIsVisible(!isVisible);
  };

  // Calculate position when visibility changes
  useEffect(() => {
    if (isVisible) {
      // Initial calculation
      calculatePosition();
      
      // Add listeners for window resize and scroll
      window.addEventListener("resize", calculatePosition);
      window.addEventListener("scroll", calculatePosition, true);
      
      return () => {
        window.removeEventListener("resize", calculatePosition);
        window.removeEventListener("scroll", calculatePosition, true);
      };
    }
  }, [isVisible]);

  return (
    <>
      <TooltipContainer 
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        aria-label={`Info about ${title}`}
      >
        <InfoIcon aria-hidden="true">i</InfoIcon>
      </TooltipContainer>

      <TooltipPortal isVisible={isVisible}>
        <TooltipArrow
          ref={arrowRef}
          $visible={isVisible}
          $position={tooltipPosition}
          style={arrowStyle}
        />
        
        <TooltipContent 
          ref={tooltipRef}
          $visible={isVisible} 
          style={tooltipStyle}
          role="tooltip"
        >
          <TooltipTitle>{title}</TooltipTitle>
          <TooltipParagraph>{content}</TooltipParagraph>
          {actionHint && (
            <TooltipParagraph>
              <strong>Tip:</strong> {actionHint}
            </TooltipParagraph>
          )}
        </TooltipContent>
      </TooltipPortal>
    </>
  );
};

export default InfoTooltipPortal;