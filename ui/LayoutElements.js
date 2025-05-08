import styled from 'styled-components';

/**
 * ContentContainer - A container with consistent padding for page content
 */
const ContentContainer = styled.div`
  padding: 0 2rem 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem 1.5rem;
  }
`;

/**
 * Section - A styled section with consistent styling, borders and shadow
 */
const Section = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: ${props => props.$noMargin ? '0' : '1.5rem'};
`;

/**
 * Grid - A flexible grid layout container
 */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns || 1}, 1fr);
  gap: ${props => props.$gap || '1rem'};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(${props => Math.min(props.$columns, 2) || 1}, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

/**
 * Flex - A flexible layout container
 */
const Flex = styled.div`
  display: flex;
  flex-direction: ${props => props.$direction || 'row'};
  justify-content: ${props => props.$justify || 'flex-start'};
  align-items: ${props => props.$align || 'stretch'};
  gap: ${props => props.$gap || '0'};
  flex-wrap: ${props => props.$wrap ? 'wrap' : 'nowrap'};
  
  @media (max-width: 576px) {
    flex-direction: ${props => props.$mobileDirection || props.$direction || 'column'};
  }
`;

export { ContentContainer, Section, Grid, Flex };