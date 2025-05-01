import React from "react";
import styled from "styled-components";

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

const ToolCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ToolCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
`;

const ToolName = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
  border-bottom: 2px solid #4e7fff;
  padding-bottom: 0.5rem;
`;

const ToolStat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #718096;
`;

const StatValue = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 0.75rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #718096;
    border-bottom: 2px solid #e2e8f0;
  }
  
  td {
    padding: 0.75rem;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.875rem;
  }
  
  tr:nth-child(even) {
    background-color: #f8fafc;
  }
`;

const BarContainer = styled.div`
  height: 1rem;
  background-color: #edf2f7;
  border-radius: 0.25rem;
  margin-top: 0.25rem;
  overflow: hidden;
`;

const Bar = styled.div`
  height: 100%;
  background-color: #4e7fff;
  width: ${props => `${props.$percentage}%`};
`;

const DistributionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const DistributionItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DistributionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
`;

const DistributionName = styled.div`
  font-weight: 600;
  color: #4a5568;
`;

const DistributionValue = styled.div`
  color: #718096;
`;

const ToolsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ToolChip = styled.div`
  background-color: ${props => props.$index % 2 === 0 ? '#ebf5ff' : '#e6fffa'};
  color: ${props => props.$index % 2 === 0 ? '#3182ce' : '#319795'};
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-style: italic;
`;

// Bubble chart section for plotting tools
const BubbleChartContainer = styled.div`
  height: 400px;
  position: relative;
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: #f8fafc;
`;

const ChartAxis = styled.div`
  position: absolute;
  background-color: #a0aec0;
  
  &.x-axis {
    bottom: 40px;
    left: 60px;
    right: 20px;
    height: 1px;
  }
  
  &.y-axis {
    bottom: 40px;
    left: 60px;
    width: 1px;
    top: 20px;
  }
`;

const AxisLabel = styled.div`
  position: absolute;
  font-size: 0.75rem;
  color: #718096;
  
  &.x-label {
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  &.y-label {
    left: 10px;
    top: 50%;
    transform: translateY(-50%) rotate(-90deg);
    transform-origin: left center;
  }
`;

const Bubble = styled.div`
  position: absolute;
  background-color: rgba(78, 127, 255, 0.5);
  border: 1px solid rgba(78, 127, 255, 0.8);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #2d3748;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
  
  &:hover {
    z-index: 10;
    background-color: rgba(78, 127, 255, 0.7);
  }
`;

/**
 * Presentation component for the AI Tool Effectiveness report
 */
const ToolEffectivenessPresentation = ({ toolsData }) => {
  const { toolsComparison, roleDistribution, taskDistribution } = toolsData;
  
  // Format number with commas and 1 decimal place
  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: 1,
      maximumFractionDigits: 1 
    });
  };
  
  // Format percentage with 1 decimal place
  const formatPercent = (num) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: 1,
      maximumFractionDigits: 1 
    }) + '%';
  };
  
  // Find max values for bubble chart scaling
  const maxAverageSaved = Math.max(...toolsComparison.map(tool => tool.averageSaved), 1);
  const maxComplexity = Math.max(...toolsComparison.map(tool => tool.averageComplexity), 1);
  const maxTasks = Math.max(...toolsComparison.map(tool => tool.totalTasks), 1);
  
  // Calculate bubble positions and sizes for the chart
  const bubbles = toolsComparison.map(tool => {
    // Scale between 10% and 90% of axis
    const x = 60 + ((tool.averageSaved / maxAverageSaved) * 0.8 * (window.innerWidth - 100));
    const y = 20 + ((1 - (tool.averageComplexity / maxComplexity)) * 0.8 * 360);
    
    // Scale radius between 15px and 60px based on total tasks
    const minRadius = 15;
    const maxRadius = 60;
    const radius = minRadius + ((tool.totalTasks / maxTasks) * (maxRadius - minRadius));
    
    return {
      name: tool.name,
      x, 
      y,
      radius,
      totalSaved: tool.totalSaved,
      totalTasks: tool.totalTasks,
      averageSaved: tool.averageSaved,
      averageComplexity: tool.averageComplexity
    };
  });
  
  // If no tools data is available
  if (toolsComparison.length === 0) {
    return (
      <ReportContainer>
        <ReportTitle>AI Tool Effectiveness Comparison</ReportTitle>
        <NoDataMessage>No tool effectiveness data available for the selected filters.</NoDataMessage>
      </ReportContainer>
    );
  }

  return (
    <ReportContainer>
      <ReportTitle>AI Tool Effectiveness Comparison</ReportTitle>
      
      {/* Tool Cards Grid */}
      <ToolCardsGrid>
        {toolsComparison.map((tool, index) => (
          <ToolCard key={index}>
            <ToolName>{tool.name}</ToolName>
            <ToolStat>
              <StatLabel>Total Time Saved</StatLabel>
              <StatValue>{formatNumber(tool.totalSaved)} hrs</StatValue>
            </ToolStat>
            <ToolStat>
              <StatLabel>Avg. Time Saved Per Task</StatLabel>
              <StatValue>{formatNumber(tool.averageSaved)} hrs</StatValue>
            </ToolStat>
            <ToolStat>
              <StatLabel>Number of Tasks</StatLabel>
              <StatValue>{tool.totalTasks}</StatValue>
            </ToolStat>
            <ToolStat>
              <StatLabel>Top Role</StatLabel>
              <StatValue>{tool.roles.length > 0 ? tool.roles[0].name : 'N/A'}</StatValue>
            </ToolStat>
            <ToolStat>
              <StatLabel>Top Task</StatLabel>
              <StatValue>{tool.tasks.length > 0 ? tool.tasks[0].name : 'N/A'}</StatValue>
            </ToolStat>
          </ToolCard>
        ))}
      </ToolCardsGrid>
      
      {/* Comparative Charts Section */}
      <Section>
        <SectionTitle>Tool Comparison</SectionTitle>
        <Table>
          <thead>
            <tr>
              <th>AI Tool</th>
              <th>Total Saved (hrs)</th>
              <th>Tasks</th>
              <th>Avg. Saved (hrs)</th>
              <th>Top Role</th>
            </tr>
          </thead>
          <tbody>
            {toolsComparison.map((tool, index) => (
              <tr key={index}>
                <td>{tool.name}</td>
                <td>{formatNumber(tool.totalSaved)}</td>
                <td>{tool.totalTasks}</td>
                <td>{formatNumber(tool.averageSaved)}</td>
                <td>{tool.roles.length > 0 ? tool.roles[0].name : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>
      
      {/* Optional Bubble Chart for Visual Comparison */}
      {toolsComparison.length > 1 && (
        <Section>
          <SectionTitle>Visual Comparison</SectionTitle>
          <BubbleChartContainer>
            <ChartAxis className="x-axis" />
            <ChartAxis className="y-axis" />
            <AxisLabel className="x-label">Average Time Saved per Task (hrs)</AxisLabel>
            <AxisLabel className="y-label">Average Complexity</AxisLabel>
            
            {bubbles.map((bubble, index) => (
              <Bubble 
                key={index}
                style={{
                  left: `${bubble.x}px`,
                  top: `${bubble.y}px`,
                  width: `${bubble.radius * 2}px`,
                  height: `${bubble.radius * 2}px`,
                  padding: `${bubble.radius / 2}px`,
                }}
                title={`${bubble.name}: ${formatNumber(bubble.totalSaved)} hrs saved across ${bubble.totalTasks} tasks (Avg: ${formatNumber(bubble.averageSaved)} hrs per task)`}
              >
                {bubble.name}
              </Bubble>
            ))}
          </BubbleChartContainer>
        </Section>
      )}
      
      {/* Role Distribution */}
      <DistributionGrid>
        <Section>
          <SectionTitle>Role Distribution</SectionTitle>
          {roleDistribution.length === 0 ? (
            <NoDataMessage>No role distribution data available.</NoDataMessage>
          ) : (
            roleDistribution.slice(0, 5).map((role, index) => {
              // Calculate total saved time for this role
              const totalSaved = role.toolBreakdown.reduce((sum, item) => sum + item.saved, 0);
              const totalCount = role.toolBreakdown.reduce((sum, item) => sum + item.count, 0);
              
              return (
                <DistributionItem key={index}>
                  <DistributionHeader>
                    <DistributionName>{role.role}</DistributionName>
                    <DistributionValue>{formatNumber(totalSaved)} hrs saved</DistributionValue>
                  </DistributionHeader>
                  <ToolsList>
                    {role.toolBreakdown.map((item, toolIndex) => (
                      <ToolChip key={toolIndex} $index={toolIndex}>
                        {item.tool}
                        <span>({formatNumber(item.saved)} hrs)</span>
                      </ToolChip>
                    ))}
                  </ToolsList>
                </DistributionItem>
              );
            })
          )}
        </Section>
        
        {/* Task Distribution */}
        <Section>
          <SectionTitle>Task Distribution</SectionTitle>
          {taskDistribution.length === 0 ? (
            <NoDataMessage>No task distribution data available.</NoDataMessage>
          ) : (
            taskDistribution.slice(0, 5).map((task, index) => {
              // Calculate total saved time for this task
              const totalSaved = task.toolBreakdown.reduce((sum, item) => sum + item.saved, 0);
              const totalCount = task.toolBreakdown.reduce((sum, item) => sum + item.count, 0);
              
              return (
                <DistributionItem key={index}>
                  <DistributionHeader>
                    <DistributionName>{task.task}</DistributionName>
                    <DistributionValue>{formatNumber(totalSaved)} hrs saved</DistributionValue>
                  </DistributionHeader>
                  <ToolsList>
                    {task.toolBreakdown.map((item, toolIndex) => (
                      <ToolChip key={toolIndex} $index={toolIndex}>
                        {item.tool}
                        <span>({formatNumber(item.saved)} hrs)</span>
                      </ToolChip>
                    ))}
                  </ToolsList>
                </DistributionItem>
              );
            })
          )}
        </Section>
      </DistributionGrid>
    </ReportContainer>
  );
};

export default ToolEffectivenessPresentation;