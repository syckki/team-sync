import React from 'react';
import styled from 'styled-components';

const OfflineContainer = styled.div`
  background-color: ${props => props.hasCachedContent ? '#f8f8ff' : '#fffbeb'};
  border: 1px solid ${props => props.hasCachedContent ? '#c7d2fe' : '#fef3c7'};
  border-left: 4px solid ${props => props.hasCachedContent ? '#818cf8' : '#fbbf24'};
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  display: ${props => props.isVisible ? 'flex' : 'none'};
  justify-content: space-between;
  align-items: center;
`;

const OfflineText = styled.div`
  font-weight: ${props => props.hasCachedContent ? 'normal' : 'bold'};
  color: ${props => props.hasCachedContent ? '#4f46e5' : '#92400e'};
`;

const OfflineIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => props.isOffline ? '#ef4444' : '#22c55e'};
  margin-left: 0.5rem;
`;

const CachedBadge = styled.span`
  background-color: #9333ea;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
  font-weight: bold;
`;

/**
 * Component for showing offline status and cached content indicator
 * @param {Object} props Component props
 * @param {boolean} props.isOffline Whether the user is currently offline
 * @param {boolean} props.hasCachedContent Whether the content being displayed is from cache
 */
const OfflineIndicator = ({ isOffline, hasCachedContent }) => {
  // Only show if offline or using cached content
  const isVisible = isOffline || hasCachedContent;
  
  return (
    <OfflineContainer 
      isVisible={isVisible} 
      hasCachedContent={hasCachedContent}
    >
      <OfflineText hasCachedContent={hasCachedContent}>
        {isOffline 
          ? 'You are currently offline. ' 
          : 'You are online. '}
        {hasCachedContent && 'Showing cached content from a previous session.'}
        {hasCachedContent && <CachedBadge>Cached</CachedBadge>}
      </OfflineText>
      
      <OfflineIcon isOffline={isOffline} />
    </OfflineContainer>
  );
};

export default OfflineIndicator;