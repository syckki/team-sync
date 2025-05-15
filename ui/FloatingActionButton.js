import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const FABContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const FAB = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: #fff;
  border: none;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 24px;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryDark || props.theme.colors.primary};
    transform: scale(1.05);
    box-shadow: 0 5px 8px rgba(0, 0, 0, 0.3);
  }
  
  &:focus {
    outline: none;
  }
`;

const OpenInNewTabButton = styled(FAB)`
  background-color: ${props => props.theme.colors.secondary || '#4caf50'};
  
  &:hover {
    background-color: ${props => props.theme.colors.secondaryDark || '#388e3c'};
  }
`;

const IframeOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 999;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const StyledIframe = styled.iframe`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  z-index: 1000;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const CloseButton = styled.button`
  position: fixed;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  color: #000;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  font-size: 20px;
`;

/**
 * FloatingActionButton component that toggles a full-screen iframe
 * 
 * @param {Object} props
 * @param {string} props.iframeSrc - The URL to load in the iframe
 * @param {string} props.buttonIcon - Icon or text to display in the main button
 * @param {string} props.openInNewIcon - Icon or text for the "open in new tab" button
 * @param {string} props.closeIcon - Icon or text for the close button
 * @param {string} props.ariaLabel - Accessibility label for the button
 * @returns {React.ReactElement}
 */
const FloatingActionButton = ({
  iframeSrc,
  buttonIcon = "🔍",
  openInNewIcon = "↗️",
  closeIcon = "✖",
  ariaLabel = "Toggle inspector",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Close iframe with escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);
  
  const toggleIframe = () => {
    setIsOpen(!isOpen);
  };
  
  const openInNewTab = () => {
    window.open(iframeSrc, '_blank');
  };
  
  return (
    <>
      <FABContainer>
        {isOpen && (
          <OpenInNewTabButton
            onClick={openInNewTab}
            aria-label="Open in new tab"
          >
            {openInNewIcon}
          </OpenInNewTabButton>
        )}
        <FAB 
          onClick={toggleIframe}
          aria-label={ariaLabel}
        >
          {buttonIcon}
        </FAB>
      </FABContainer>
      
      <IframeOverlay isOpen={isOpen} onClick={toggleIframe} />
      
      <CloseButton 
        isOpen={isOpen} 
        onClick={toggleIframe}
        aria-label="Close"
      >
        {closeIcon}
      </CloseButton>
      
      <StyledIframe 
        isOpen={isOpen}
        src={isOpen ? iframeSrc : 'about:blank'}
        title="Embedded Content"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </>
  );
};

export default FloatingActionButton;