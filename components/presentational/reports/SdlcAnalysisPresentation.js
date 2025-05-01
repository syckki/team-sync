import React, { useState } from "react";
import styled from "styled-components";
import ResponsiveTable from "../ResponsiveTable";

// Styled components for the report
const ReportContainer = styled.div`
  margin: 1.5rem 0;
`;

const ReportTitle = styled.h2`
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1px;
  
  @media (max-width: 640px) {
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const TabButton = styled.button`
  padding: 0.75rem 1.25rem;
  background-color: ${props => props.$active ? '#4e7fff' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#4a5568'};
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#4e7fff' : 'transparent'};
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.$active ? '#4e7fff' : '#f7fafc'};
  }
`;

const Section = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const ChartContainer = styled.div`
  margin: 1.5rem 0;
`;

const ChartRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const ChartLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.25rem;
  display: flex;
  justify-content: space-between;
`;

const ChartValue = styled.div`
  font-size: 0.75rem;
  color: #718096;
`;

const BarContainer = styled.div`
  height: 1.5rem;
  background-color: #edf2f7;
  border-radius: 0.25rem;
  overflow: hidden;
  display: flex;
`;

const Bar = styled.div`
  height: 100%;
  background-color: ${props => props.$color || '#4e7fff'};
  width: ${props => `${props.$percentage}%`};
  transition: width 0.3s ease;
`;

const SankeyContainer = styled.div`
  height: 500px;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: #f8fafc;
  
  /* Placeholder for Sankey diagram */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #718096;
  font-style: italic;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-style: italic;
`;

const ToolChip = styled.span`
  display: inline-block;
  background-color: #ebf5ff;
  color: #3182ce;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  margin-right: 0.25rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
`;

const FlexGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MetricCard = styled.div`
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
`;

const MetricTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
`;

const MetricSubtext = styled.div`
  font-size: 0.75rem;
  color: #718096;
`;

/**
 * Presentation component for the AI Impact on SDLC and Task Types report
 */
const SdlcAnalysisPresentation = ({ analysisData, filters }) => {
  // State to track active tab
  const [activeTab, setActiveTab] = useState('phases');
  
  const { 
    sdlcPhaseAnalysis, 
    sdlcTaskAnalysis, 
    aiToolsBySdlcPhase,
    taskCategoryAnalysis,
    sankeyData
  } = analysisData;
  
  // Format number with commas and 1 decimal place
  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: 1,
      maximumFractionDigits: 1 
    });
  };
  
  // Tool color mapping for consistent color assignment
  const toolColors = {
    'Gemini': '#4285F4',
    'ChatGPT': '#19C37D',
    'Claude': '#9A34FF',
    'GitHub Copilot': '#7FD1EC',
    'Midjourney': '#FF9999',
    'DALL-E': '#FFB84D',
    'Stable Diffusion': '#FF7752',
    'Not Specified': '#A0AEC0'
  };
  
  // Get color for a tool (with fallback)
  const getToolColor = (toolName) => {
    const predefinedColors = ['#4e7fff', '#34D399', '#F59E0B', '#EC4899', '#8B5CF6', '#10B981'];
    if (toolColors[toolName]) return toolColors[toolName];
    
    // Generate a color based on tool name hash if not in predefined list
    const hash = toolName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const index = Math.abs(hash) % predefinedColors.length;
    return predefinedColors[index];
  };
  
  // Create table columns for SDLC phases
  const phaseColumns = [
    { header: 'SDLC Phase', field: 'phase' },
    { header: 'Time Saved', field: 'totalHoursSaved', render: (value) => `${formatNumber(value)} hrs` },
    { header: 'Avg. Saved/Task', field: 'averageHoursSaved', render: (value) => `${formatNumber(value)} hrs` },
    { 
      header: 'Most Effective Tools', 
      field: 'mostEffectiveTools',
      render: (tools) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {tools.map((tool, i) => (
            <ToolChip key={i} style={{ backgroundColor: `${getToolColor(tool)}20`, color: getToolColor(tool) }}>
              {tool}
            </ToolChip>
          ))}
        </div>
      )
    },
    { header: 'Tasks Reported', field: 'taskCount' }
  ];
  
  // Create table columns for SDLC tasks
  const taskColumns = [
    { header: 'SDLC Task', field: 'task' },
    { header: 'SDLC Phase', field: 'phase' },
    { header: 'Time Saved', field: 'totalHoursSaved', render: (value) => `${formatNumber(value)} hrs` },
    { header: 'Avg. Saved/Task', field: 'averageHoursSaved', render: (value) => `${formatNumber(value)} hrs` },
    { 
      header: 'Most Effective Tools', 
      field: 'mostEffectiveTools',
      render: (tools) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {tools.map((tool, i) => (
            <ToolChip key={i} style={{ backgroundColor: `${getToolColor(tool)}20`, color: getToolColor(tool) }}>
              {tool}
            </ToolChip>
          ))}
        </div>
      )
    },
    { header: 'Tasks Reported', field: 'taskCount' }
  ];
  
  // Create table columns for task categories
  const categoryColumns = [
    { header: 'Task Category', field: 'category' },
    { header: 'Time Saved', field: 'totalHoursSaved', render: (value) => `${formatNumber(value)} hrs` },
    { header: 'Avg. Saved/Task', field: 'averageHoursSaved', render: (value) => `${formatNumber(value)} hrs` },
    { 
      header: 'Most Effective Tools', 
      field: 'mostEffectiveTools',
      render: (tools) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {tools.map((tool, i) => (
            <ToolChip key={i} style={{ backgroundColor: `${getToolColor(tool)}20`, color: getToolColor(tool) }}>
              {tool}
            </ToolChip>
          ))}
        </div>
      )
    },
    { header: 'Tasks Reported', field: 'taskCount' }
  ];
  
  // Generate bar chart data for visualization
  const generateBarChartData = (data) => {
    if (!data || data.length === 0) return [];
    
    // Find maximum value for scaling
    const maxValue = Math.max(...data.map(item => item.totalHoursSaved));
    
    return data.slice(0, 10).map(item => ({
      label: item.phase || item.task || item.category,
      value: item.totalHoursSaved,
      percentage: (item.totalHoursSaved / maxValue) * 100,
      color: '#4e7fff'
    }));
  };
  
  // If no data is available
  if ((!sdlcPhaseAnalysis || sdlcPhaseAnalysis.length === 0) && 
      (!sdlcTaskAnalysis || sdlcTaskAnalysis.length === 0) &&
      (!taskCategoryAnalysis || taskCategoryAnalysis.length === 0)) {
    return (
      <ReportContainer>
        <ReportTitle>AI Impact on the Software Development Lifecycle</ReportTitle>
        <NoDataMessage>No SDLC productivity data available for the selected filters.</NoDataMessage>
      </ReportContainer>
    );
  }
  
  // Get data for the active tab
  const barChartData = activeTab === 'phases' 
    ? generateBarChartData(sdlcPhaseAnalysis)
    : activeTab === 'tasks' 
      ? generateBarChartData(sdlcTaskAnalysis)
      : generateBarChartData(taskCategoryAnalysis);
  
  // Calculate total metrics across all phases/tasks
  const totalMetrics = {
    phases: sdlcPhaseAnalysis.length,
    tasks: sdlcTaskAnalysis.length,
    totalHoursSaved: 0,
    totalTasks: 0
  };
  
  sdlcPhaseAnalysis.forEach(phase => {
    totalMetrics.totalHoursSaved += phase.totalHoursSaved;
    totalMetrics.totalTasks += phase.taskCount;
  });
  
  // Average time saved per task
  const avgTimeSavedPerTask = totalMetrics.totalTasks > 0 
    ? totalMetrics.totalHoursSaved / totalMetrics.totalTasks 
    : 0;
  
  // Find the phase with the most time saved
  const mostImpactfulPhase = sdlcPhaseAnalysis.length > 0 
    ? sdlcPhaseAnalysis[0].phase 
    : 'None';
  
  // Find the most used AI tool across all phases
  const allToolUsage = {};
  sdlcPhaseAnalysis.forEach(phase => {
    phase.aiTools.forEach(tool => {
      if (!allToolUsage[tool.tool]) {
        allToolUsage[tool.tool] = {
          tool: tool.tool,
          hoursSaved: 0,
          usageCount: 0
        };
      }
      allToolUsage[tool.tool].hoursSaved += tool.hoursSaved;
      allToolUsage[tool.tool].usageCount += tool.usageCount;
    });
  });
  
  const mostEffectiveTool = Object.values(allToolUsage)
    .sort((a, b) => b.hoursSaved - a.hoursSaved)[0]?.tool || 'None';

  return (
    <ReportContainer>
      <ReportTitle>AI Impact on the Software Development Lifecycle</ReportTitle>
      
      {/* Summary metrics */}
      <FlexGrid>
        <MetricCard>
          <MetricTitle>Total Time Saved</MetricTitle>
          <MetricValue>{formatNumber(totalMetrics.totalHoursSaved)} hrs</MetricValue>
          <MetricSubtext>Across {totalMetrics.totalTasks} reported tasks</MetricSubtext>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>Average Time Saved per Task</MetricTitle>
          <MetricValue>{formatNumber(avgTimeSavedPerTask)} hrs</MetricValue>
          <MetricSubtext>Productivity boost per task</MetricSubtext>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>Most Impactful SDLC Phase</MetricTitle>
          <MetricValue>{mostImpactfulPhase}</MetricValue>
          <MetricSubtext>Highest total time savings</MetricSubtext>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>Most Effective AI Tool</MetricTitle>
          <MetricValue>{mostEffectiveTool}</MetricValue>
          <MetricSubtext>Highest overall time savings</MetricSubtext>
        </MetricCard>
      </FlexGrid>
      
      {/* Tab Navigation */}
      <TabsContainer>
        <TabButton 
          $active={activeTab === 'phases'} 
          onClick={() => setActiveTab('phases')}
        >
          By SDLC Phase
        </TabButton>
        <TabButton 
          $active={activeTab === 'tasks'} 
          onClick={() => setActiveTab('tasks')}
        >
          By SDLC Task
        </TabButton>
        <TabButton 
          $active={activeTab === 'categories'} 
          onClick={() => setActiveTab('categories')}
        >
          By Task Category
        </TabButton>
        <TabButton 
          $active={activeTab === 'sankey'} 
          onClick={() => setActiveTab('sankey')}
        >
          Flow Visualization
        </TabButton>
      </TabsContainer>
      
      {/* SDLC Phases Tab */}
      {activeTab === 'phases' && (
        <>
          <Section>
            <SectionTitle>Time Saved by SDLC Phase</SectionTitle>
            <ChartContainer>
              {barChartData.map((item, index) => (
                <ChartRow key={index}>
                  <ChartLabel>
                    {item.label}
                    <ChartValue>{formatNumber(item.value)} hrs saved</ChartValue>
                  </ChartLabel>
                  <BarContainer>
                    <Bar 
                      $color="#4e7fff"
                      $percentage={item.percentage}
                    />
                  </BarContainer>
                </ChartRow>
              ))}
            </ChartContainer>
          </Section>
          
          <Section>
            <SectionTitle>SDLC Phase Analysis</SectionTitle>
            {sdlcPhaseAnalysis.length > 0 ? (
              <ResponsiveTable 
                data={sdlcPhaseAnalysis}
                columns={phaseColumns}
                keyField="phase"
                emptyMessage="No SDLC phase data available"
                headerTitle="SDLC Phase"
              />
            ) : (
              <NoDataMessage>No SDLC phase data available.</NoDataMessage>
            )}
          </Section>
        </>
      )}
      
      {/* SDLC Tasks Tab */}
      {activeTab === 'tasks' && (
        <>
          <Section>
            <SectionTitle>Time Saved by SDLC Task</SectionTitle>
            <ChartContainer>
              {barChartData.map((item, index) => (
                <ChartRow key={index}>
                  <ChartLabel>
                    {item.label}
                    <ChartValue>{formatNumber(item.value)} hrs saved</ChartValue>
                  </ChartLabel>
                  <BarContainer>
                    <Bar 
                      $color="#4e7fff"
                      $percentage={item.percentage}
                    />
                  </BarContainer>
                </ChartRow>
              ))}
            </ChartContainer>
          </Section>
          
          <Section>
            <SectionTitle>SDLC Task Analysis</SectionTitle>
            {sdlcTaskAnalysis.length > 0 ? (
              <ResponsiveTable 
                data={sdlcTaskAnalysis}
                columns={taskColumns}
                keyField="task"
                emptyMessage="No SDLC task data available"
                headerTitle="SDLC Task"
              />
            ) : (
              <NoDataMessage>No SDLC task data available.</NoDataMessage>
            )}
          </Section>
        </>
      )}
      
      {/* Task Categories Tab */}
      {activeTab === 'categories' && (
        <>
          <Section>
            <SectionTitle>Time Saved by Task Category</SectionTitle>
            <ChartContainer>
              {barChartData.map((item, index) => (
                <ChartRow key={index}>
                  <ChartLabel>
                    {item.label}
                    <ChartValue>{formatNumber(item.value)} hrs saved</ChartValue>
                  </ChartLabel>
                  <BarContainer>
                    <Bar 
                      $color="#4e7fff"
                      $percentage={item.percentage}
                    />
                  </BarContainer>
                </ChartRow>
              ))}
            </ChartContainer>
          </Section>
          
          <Section>
            <SectionTitle>Task Category Analysis</SectionTitle>
            {taskCategoryAnalysis.length > 0 ? (
              <ResponsiveTable 
                data={taskCategoryAnalysis}
                columns={categoryColumns}
                keyField="category"
                emptyMessage="No task category data available"
                headerTitle="Task Category"
              />
            ) : (
              <NoDataMessage>No task category data available.</NoDataMessage>
            )}
          </Section>
        </>
      )}
      
      {/* Sankey Diagram Tab */}
      {activeTab === 'sankey' && (
        <Section>
          <SectionTitle>AI Tool to SDLC Phase Flow</SectionTitle>
          <SankeyContainer>
            <p>Sankey Diagram Visualization</p>
            <p style={{ fontSize: '0.875rem' }}>
              Shows the flow of time savings from AI tools to specific SDLC phases.
            </p>
            <p style={{ fontSize: '0.75rem', marginTop: '1rem' }}>
              Note: To implement a real Sankey diagram, a dedicated visualization library <br />
              like D3.js or react-flow-diagram would be required.
            </p>
          </SankeyContainer>
          
          <SectionTitle>AI Tools by SDLC Phase</SectionTitle>
          {Object.keys(aiToolsBySdlcPhase).length > 0 ? (
            Object.entries(aiToolsBySdlcPhase).map(([phase, tools]) => (
              <div key={phase} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.5rem' }}>{phase}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {tools.map((tool, index) => (
                    <ToolChip 
                      key={index} 
                      style={{ 
                        backgroundColor: `${getToolColor(tool.tool)}20`, 
                        color: getToolColor(tool.tool),
                        padding: '0.375rem 0.625rem',
                        fontSize: '0.8rem'
                      }}
                    >
                      {tool.tool} ({formatNumber(tool.hoursSaved)} hrs)
                    </ToolChip>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <NoDataMessage>No AI tool usage data available by SDLC phase.</NoDataMessage>
          )}
        </Section>
      )}
    </ReportContainer>
  );
};

export default SdlcAnalysisPresentation;