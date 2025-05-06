import React, { useState } from 'react';
import styled from 'styled-components';

// Styled components
const PredictionPanelContainer = styled.div`
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PanelTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  display: flex;
  align-items: center;
  
  svg {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    color: #4f46e5;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f3f4f6;
  }
  
  svg {
    width: 16px;
    height: 16px;
    margin-left: 4px;
    transition: transform 0.2s ease;
    transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const PredictionContent = styled.div`
  overflow: hidden;
  max-height: ${props => props.expanded ? '2000px' : '0px'};
  transition: max-height 0.5s ease;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
`;

const TabButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: ${props => props.active ? '#4f46e5' : '#6b7280'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#4f46e5' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    color: #4f46e5;
  }
`;

const PredictionCard = styled.div`
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const TaskCategory = styled.h4`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ConfidenceTag = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background-color: ${props => {
    if (props.score >= 80) return '#dcfce7';
    if (props.score >= 60) return '#fef9c3';
    return '#fee2e2';
  }};
  color: ${props => {
    if (props.score >= 80) return '#16a34a';
    if (props.score >= 60) return '#ca8a04';
    return '#dc2626';
  }};
  font-weight: 500;
`;

const TaskDetails = styled.div`
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #4b5563;
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 0.25rem;
  
  span:first-child {
    width: 120px;
    color: #6b7280;
  }
  
  span:last-child {
    font-weight: 500;
    color: #374151;
  }
`;

const ToolsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ToolTag = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background-color: #f3f4f6;
  color: #4b5563;
  font-weight: 500;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const ActionButton = styled.button`
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &.primary {
    background-color: #4f46e5;
    color: white;
    border: none;
    
    &:hover {
      background-color: #4338ca;
    }
  }
  
  &.secondary {
    background-color: white;
    color: #4b5563;
    border: 1px solid #d1d5db;
    
    &:hover {
      background-color: #f9fafb;
      border-color: #9ca3af;
    }
  }
`;

const ScheduleContainer = styled.div`
  margin-top: 1rem;
`;

const TimeBlock = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: ${props => props.isBreak ? '#f3f4f6' : 'white'};
  border: 1px solid #e5e7eb;
`;

const TimeInfo = styled.div`
  width: 120px;
  font-size: 0.875rem;
  color: #6b7280;
`;

const BlockContent = styled.div`
  flex: 1;
`;

const BlockTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const BlockDetails = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 1rem;
  color: #6b7280;
`;

/**
 * Component that displays task predictions and scheduling suggestions
 */
const TaskPredictionPanel = ({
  predictions = [],
  schedule = null,
  isLoading = false,
  onAddTask,
  onIgnoreTask,
  onUseSchedule,
  onAdjustSchedule
}) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('predictions');
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const renderPredictions = () => {
    if (isLoading) {
      return (
        <LoadingContainer>
          <svg className="animate-spin h-5 w-5 text-gray-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div style={{ marginTop: '0.5rem' }}>Analyzing patterns...</div>
        </LoadingContainer>
      );
    }
    
    if (predictions.length === 0) {
      return (
        <NoDataMessage>
          No predictions available yet. As you complete more tasks, predictions will become more accurate.
        </NoDataMessage>
      );
    }
    
    return predictions.map((prediction, index) => (
      <PredictionCard key={index}>
        <CardHeader>
          <TaskCategory>{prediction.taskCategory}</TaskCategory>
          <ConfidenceTag score={prediction.confidence || 50}>
            {prediction.confidence}% confidence
          </ConfidenceTag>
        </CardHeader>
        
        <TaskDetails>
          <DetailRow>
            <span>Platform:</span>
            <span>{prediction.platform || 'Not specified'}</span>
          </DetailRow>
          <DetailRow>
            <span>Est. time (hrs):</span>
            <span>{prediction.estimatedTimeWithoutAI}</span>
          </DetailRow>
          <DetailRow>
            <span>Time with AI (hrs):</span>
            <span>{prediction.actualTimeWithAI}</span>
          </DetailRow>
          <DetailRow>
            <span>Suggested tools:</span>
            <span>
              <ToolsList>
                {prediction.aiToolsUsed && prediction.aiToolsUsed.map((tool, idx) => (
                  <ToolTag key={idx}>{tool}</ToolTag>
                ))}
              </ToolsList>
            </span>
          </DetailRow>
        </TaskDetails>
        
        <ButtonRow>
          <ActionButton 
            className="secondary"
            onClick={() => onIgnoreTask && onIgnoreTask(prediction)}
          >
            Ignore
          </ActionButton>
          <ActionButton 
            className="primary"
            onClick={() => onAddTask && onAddTask(prediction)}
          >
            Add to Tasks
          </ActionButton>
        </ButtonRow>
      </PredictionCard>
    ));
  };
  
  const renderSchedule = () => {
    if (isLoading) {
      return (
        <LoadingContainer>
          <svg className="animate-spin h-5 w-5 text-gray-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div style={{ marginTop: '0.5rem' }}>Optimizing schedule...</div>
        </LoadingContainer>
      );
    }
    
    if (!schedule || !schedule.timeBlocks || schedule.timeBlocks.length === 0) {
      return (
        <NoDataMessage>
          No schedule available. Add tasks to generate an optimized schedule.
        </NoDataMessage>
      );
    }
    
    return (
      <ScheduleContainer>
        {schedule.timeBlocks.map((block, index) => (
          <TimeBlock key={index} isBreak={block.type === 'break'}>
            <TimeInfo>
              {block.startTime} - {block.endTime}
              <div>{block.duration} hr{block.duration !== 1 ? 's' : ''}</div>
            </TimeInfo>
            <BlockContent>
              {block.type === 'break' ? (
                <BlockTitle>Break</BlockTitle>
              ) : (
                <>
                  <BlockTitle>{block.task.taskCategory}</BlockTitle>
                  <BlockDetails>
                    Platform: {block.task.platform || 'Not specified'}
                    {block.task.aiToolsUsed && block.task.aiToolsUsed.length > 0 && (
                      <div>
                        Tools: {block.task.aiToolsUsed.join(', ')}
                      </div>
                    )}
                  </BlockDetails>
                </>
              )}
            </BlockContent>
          </TimeBlock>
        ))}
        
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#4b5563' }}>
          <strong>Total duration:</strong> {schedule.totalDuration.toFixed(1)} hours | 
          <strong> Completion time:</strong> {schedule.completionTime}
        </div>
        
        <ButtonRow>
          <ActionButton 
            className="secondary"
            onClick={() => onAdjustSchedule && onAdjustSchedule(schedule)}
          >
            Adjust Schedule
          </ActionButton>
          <ActionButton 
            className="primary"
            onClick={() => onUseSchedule && onUseSchedule(schedule)}
          >
            Use This Schedule
          </ActionButton>
        </ButtonRow>
      </ScheduleContainer>
    );
  };
  
  return (
    <PredictionPanelContainer>
      <PanelHeader>
        <PanelTitle>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
          AI Task Predictions & Scheduling
        </PanelTitle>
        <ToggleButton expanded={expanded} onClick={toggleExpanded}>
          {expanded ? 'Hide' : 'Show'} Predictions
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </ToggleButton>
      </PanelHeader>
      
      <PredictionContent expanded={expanded}>
        <TabContainer>
          <TabButton 
            active={activeTab === 'predictions'} 
            onClick={() => setActiveTab('predictions')}
          >
            Task Predictions
          </TabButton>
          <TabButton 
            active={activeTab === 'schedule'} 
            onClick={() => setActiveTab('schedule')}
          >
            Optimized Schedule
          </TabButton>
        </TabContainer>
        
        {activeTab === 'predictions' ? renderPredictions() : renderSchedule()}
      </PredictionContent>
    </PredictionPanelContainer>
  );
};

export default TaskPredictionPanel;