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

const FlexGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
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

const BarContainer = styled.div`
  height: 1.5rem;
  background-color: #edf2f7;
  border-radius: 0.25rem;
  overflow: hidden;
  display: flex;
  margin: 0.5rem 0;
`;

const Bar = styled.div`
  height: 100%;
  background-color: ${props => props.$color || '#4e7fff'};
  width: ${props => `${props.$percentage}%`};
  transition: width 0.3s ease;
`;

const SegmentedBar = styled(BarContainer)`
  height: 2rem;
  margin: 0.75rem 0;
`;

const BarSegment = styled.div`
  height: 100%;
  width: ${props => `${props.$percentage}%`};
  background-color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$lightText ? 'white' : '#2d3748'};
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 2rem;
  
  &:first-child {
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
  }
  
  &:last-child {
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
`;

const BarChart = styled.div`
  margin: 1.5rem 0;
`;

const BarGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const BarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 0.25rem;
`;

const BarValue = styled.div`
  font-size: 0.75rem;
  color: #718096;
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

const NoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-style: italic;
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0.5rem 0 1rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #4a5568;
`;

const LegendColor = styled.div`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 0.125rem;
  margin-right: 0.25rem;
  background-color: ${props => props.$color};
`;

const ScatterPlotContainer = styled.div`
  height: 400px;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: #f8fafc;
  
  /* Placeholder for scatter plot */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #718096;
  font-style: italic;
`;

/**
 * Presentation component for the Cross-Analysis of Time Saved vs. Task Complexity and Quality Impact report
 */
const ComplexityQualityPresentation = ({ analysisData, filters }) => {
  // State to track active tab
  const [activeTab, setActiveTab] = useState('overview');
  
  const { 
    byComplexity, 
    byQuality, 
    timeVsComplexity,
    qualityByTimeSaved,
    toolsByComplexity,
    toolsByQuality,
    complexityBreakdowns,
    timeSavedThresholds
  } = analysisData;
  
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
  
  // Colors for complexity levels
  const complexityColors = {
    low: '#68D391', // Green
    medium: '#F6E05E', // Yellow
    high: '#F56565'    // Red
  };
  
  // Colors for quality impact
  const qualityColors = {
    improved: '#4FD1C5', // Teal
    neutral: '#A0AEC0',  // Gray
    needsRework: '#E53E3E' // Red
  };
  
  // Map complexity level to user-friendly text
  const complexityText = {
    low: 'Low Complexity',
    medium: 'Medium Complexity',
    high: 'High Complexity'
  };
  
  // Map quality impact to user-friendly text
  const qualityText = {
    improved: 'Improved Quality',
    neutral: 'Neutral Impact',
    needsRework: 'Needs Rework'
  };

  // Create table columns for complexity data
  const complexityColumns = [
    { 
      header: 'Complexity Level', 
      field: 'level',
      render: (value) => complexityText[value] || value
    },
    { header: 'Tasks', field: 'count' },
    { header: 'Total Time Saved', field: 'totalHoursSaved', render: (value) => `${formatNumber(value)} hrs` },
    { header: 'Avg. Saved/Task', field: 'averageHoursSaved', render: (value) => `${formatNumber(value)} hrs` }
  ];
  
  // Create table columns for quality data
  const qualityColumns = [
    { 
      header: 'Quality Impact', 
      field: 'impact',
      render: (value) => qualityText[value] || value
    },
    { header: 'Tasks', field: 'count' },
    { header: 'Total Time Saved', field: 'totalHoursSaved', render: (value) => `${formatNumber(value)} hrs` },
    { header: 'Avg. Saved/Task', field: 'averageHoursSaved', render: (value) => `${formatNumber(value)} hrs` }
  ];
  
  // Create data for complexity table
  const complexityData = Object.entries(byComplexity).map(([level, data]) => ({
    level,
    count: data.count,
    totalHoursSaved: data.totalHoursSaved,
    averageHoursSaved: data.averageHoursSaved
  }));
  
  // Create data for quality table
  const qualityData = Object.entries(byQuality).map(([impact, data]) => ({
    impact,
    count: data.count,
    totalHoursSaved: data.totalHoursSaved,
    averageHoursSaved: data.averageHoursSaved
  }));
  
  // Calculate total tasks for percentages
  const totalTasks = complexityData.reduce((sum, item) => sum + item.count, 0);
  
  // Create data for stacked bar of quality by time saved
  const qualityByTimeSavedData = Object.entries(qualityByTimeSaved).map(([category, impacts]) => {
    const total = Object.values(impacts).reduce((sum, count) => sum + count, 0);
    
    // Skip if no data
    if (total === 0) return null;
    
    return {
      category,
      total,
      improved: {
        count: impacts.improved,
        percentage: total > 0 ? (impacts.improved / total) * 100 : 0
      },
      neutral: {
        count: impacts.neutral,
        percentage: total > 0 ? (impacts.neutral / total) * 100 : 0
      },
      needsRework: {
        count: impacts.needsRework,
        percentage: total > 0 ? (impacts.needsRework / total) * 100 : 0
      }
    };
  }).filter(Boolean);
  
  // Create data for tools by complexity
  const topToolsByComplexity = {};
  Object.entries(toolsByComplexity).forEach(([complexity, tools]) => {
    // Get top 3 tools for each complexity
    topToolsByComplexity[complexity] = tools.slice(0, 3);
  });
  
  // If no data is available
  if (totalTasks === 0) {
    return (
      <ReportContainer>
        <ReportTitle>Cross-Analysis of Time Saved vs. Task Complexity and Quality</ReportTitle>
        <NoDataMessage>No complexity and quality data available for the selected filters.</NoDataMessage>
      </ReportContainer>
    );
  }

  return (
    <ReportContainer>
      <ReportTitle>Cross-Analysis of Time Saved vs. Task Complexity and Quality</ReportTitle>
      
      {/* Tab Navigation */}
      <TabsContainer>
        <TabButton 
          $active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </TabButton>
        <TabButton 
          $active={activeTab === 'complexity'} 
          onClick={() => setActiveTab('complexity')}
        >
          By Complexity
        </TabButton>
        <TabButton 
          $active={activeTab === 'quality'} 
          onClick={() => setActiveTab('quality')}
        >
          By Quality Impact
        </TabButton>
        <TabButton 
          $active={activeTab === 'correlation'} 
          onClick={() => setActiveTab('correlation')}
        >
          Correlations
        </TabButton>
      </TabsContainer>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Summary metrics */}
          <FlexGrid>
            {complexityData.map(data => (
              <MetricCard key={data.level}>
                <MetricTitle>{complexityText[data.level]}</MetricTitle>
                <MetricValue>{formatNumber(data.averageHoursSaved)} hrs</MetricValue>
                <MetricSubtext>
                  Avg. time saved per task ({data.count} tasks)
                </MetricSubtext>
                <BarContainer>
                  <Bar 
                    $color={complexityColors[data.level]} 
                    $percentage={(data.count / totalTasks) * 100} 
                  />
                </BarContainer>
                <MetricSubtext style={{ textAlign: 'right' }}>
                  {formatPercent((data.count / totalTasks) * 100)} of all tasks
                </MetricSubtext>
              </MetricCard>
            ))}
          </FlexGrid>
          
          <Section>
            <SectionTitle>Quality Distribution by Time Saved</SectionTitle>
            <Legend>
              <LegendItem>
                <LegendColor $color={qualityColors.improved} />
                Improved Quality
              </LegendItem>
              <LegendItem>
                <LegendColor $color={qualityColors.neutral} />
                Neutral Impact
              </LegendItem>
              <LegendItem>
                <LegendColor $color={qualityColors.needsRework} />
                Needs Rework
              </LegendItem>
            </Legend>
            
            {qualityByTimeSavedData.length > 0 ? (
              qualityByTimeSavedData.map(data => (
                <BarGroup key={data.category}>
                  <BarLabel>
                    {data.category === 'low' ? 'Low Time Saved' : 
                     data.category === 'medium' ? 'Medium Time Saved' : 
                     'High Time Saved'}
                    <BarValue>{data.total} tasks</BarValue>
                  </BarLabel>
                  <SegmentedBar>
                    {data.improved.count > 0 && (
                      <BarSegment 
                        $color={qualityColors.improved}
                        $percentage={data.improved.percentage}
                        $lightText={false}
                      >
                        {data.improved.count}
                      </BarSegment>
                    )}
                    {data.neutral.count > 0 && (
                      <BarSegment 
                        $color={qualityColors.neutral}
                        $percentage={data.neutral.percentage}
                        $lightText={false}
                      >
                        {data.neutral.count}
                      </BarSegment>
                    )}
                    {data.needsRework.count > 0 && (
                      <BarSegment 
                        $color={qualityColors.needsRework}
                        $percentage={data.needsRework.percentage}
                        $lightText={true}
                      >
                        {data.needsRework.count}
                      </BarSegment>
                    )}
                  </SegmentedBar>
                </BarGroup>
              ))
            ) : (
              <NoDataMessage>No quality distribution data available.</NoDataMessage>
            )}
            
            <p style={{ fontSize: '0.875rem', color: '#718096', marginTop: '1rem' }}>
              This chart shows the distribution of quality outcomes across tasks with different levels of time saved.
              {timeSavedThresholds && (
                <>
                  <br/>
                  <span style={{ fontSize: '0.75rem' }}>
                    Time saved thresholds: Low &lt; {formatNumber(timeSavedThresholds.low)} hrs, 
                    High &gt; {formatNumber(timeSavedThresholds.high)} hrs
                  </span>
                </>
              )}
            </p>
          </Section>
          
          <Section>
            <SectionTitle>Quality Impact by Complexity Level</SectionTitle>
            <ResponsiveTable 
              data={complexityData}
              columns={complexityColumns}
              keyField="level"
              emptyMessage="No complexity data available"
              headerTitle="Complexity Level"
            />
            
            <ResponsiveTable 
              data={qualityData}
              columns={qualityColumns}
              keyField="impact"
              emptyMessage="No quality impact data available"
              headerTitle="Quality Impact"
              style={{ marginTop: '1.5rem' }}
            />
          </Section>
        </>
      )}
      
      {/* Complexity Tab */}
      {activeTab === 'complexity' && (
        <>
          <Section>
            <SectionTitle>Time Saved by Complexity Level</SectionTitle>
            <BarChart>
              {complexityData.map(data => (
                <BarGroup key={data.level}>
                  <BarLabel>
                    {complexityText[data.level]}
                    <BarValue>{formatNumber(data.totalHoursSaved)} hrs saved</BarValue>
                  </BarLabel>
                  <BarContainer>
                    <Bar 
                      $color={complexityColors[data.level]} 
                      $percentage={(data.totalHoursSaved / Math.max(...complexityData.map(d => d.totalHoursSaved))) * 100} 
                    />
                  </BarContainer>
                </BarGroup>
              ))}
            </BarChart>
          </Section>
          
          <Section>
            <SectionTitle>Most Effective Tools by Complexity Level</SectionTitle>
            {Object.entries(topToolsByComplexity).map(([complexity, tools]) => (
              <div key={complexity} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: '500', 
                  marginBottom: '0.75rem',
                  color: complexityColors[complexity] 
                }}>
                  {complexityText[complexity]}
                </h4>
                
                {tools.length > 0 ? (
                  <Table>
                    <thead>
                      <tr>
                        <th>AI Tool</th>
                        <th>Tasks</th>
                        <th>Total Time Saved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tools.map((tool, index) => (
                        <tr key={index}>
                          <td>{tool.tool}</td>
                          <td>{tool.count}</td>
                          <td>{formatNumber(tool.totalHoursSaved)} hrs</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <NoDataMessage>No tool data available for {complexityText[complexity]}.</NoDataMessage>
                )}
              </div>
            ))}
          </Section>
          
          {complexityBreakdowns?.byRole && complexityBreakdowns.byRole.length > 0 && (
            <Section>
              <SectionTitle>Complexity Distribution by Role</SectionTitle>
              <Table>
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Low</th>
                    <th>Medium</th>
                    <th>High</th>
                    <th>Total Time Saved</th>
                  </tr>
                </thead>
                <tbody>
                  {complexityBreakdowns.byRole.map((item, index) => (
                    <tr key={index}>
                      <td>{item.role}</td>
                      <td>{item.low}</td>
                      <td>{item.medium}</td>
                      <td>{item.high}</td>
                      <td>{formatNumber(item.totalHoursSaved)} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Section>
          )}
        </>
      )}
      
      {/* Quality Tab */}
      {activeTab === 'quality' && (
        <>
          <Section>
            <SectionTitle>Time Saved by Quality Impact</SectionTitle>
            <BarChart>
              {qualityData.map(data => (
                <BarGroup key={data.impact}>
                  <BarLabel>
                    {qualityText[data.impact]}
                    <BarValue>{formatNumber(data.totalHoursSaved)} hrs saved</BarValue>
                  </BarLabel>
                  <BarContainer>
                    <Bar 
                      $color={qualityColors[data.impact]} 
                      $percentage={(data.totalHoursSaved / Math.max(...qualityData.map(d => d.totalHoursSaved))) * 100} 
                    />
                  </BarContainer>
                </BarGroup>
              ))}
            </BarChart>
          </Section>
          
          <Section>
            <SectionTitle>Tools by Quality Impact</SectionTitle>
            {Object.entries(toolsByQuality).map(([quality, tools]) => {
              // Skip if no tools data
              if (!tools || tools.length === 0) return null;
              
              return (
                <div key={quality} style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: '500', 
                    marginBottom: '0.75rem',
                    color: qualityColors[quality] 
                  }}>
                    {qualityText[quality]}
                  </h4>
                  
                  {tools.length > 0 ? (
                    <Table>
                      <thead>
                        <tr>
                          <th>AI Tool</th>
                          <th>Tasks</th>
                          <th>Total Time Saved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tools.slice(0, 3).map((tool, index) => (
                          <tr key={index}>
                            <td>{tool.tool}</td>
                            <td>{tool.count}</td>
                            <td>{formatNumber(tool.totalHoursSaved)} hrs</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <NoDataMessage>No tool data available for {qualityText[quality]}.</NoDataMessage>
                  )}
                </div>
              );
            })}
          </Section>
        </>
      )}
      
      {/* Correlation Tab */}
      {activeTab === 'correlation' && (
        <>
          {timeVsComplexity.length > 0 ? (
            <Section>
              <SectionTitle>Time Saved vs. Complexity</SectionTitle>
              <ScatterPlotContainer>
                <p>Scatter Plot Visualization</p>
                <p style={{ fontSize: '0.875rem' }}>
                  Plots task complexity against time saved, with points colored by quality impact.
                </p>
                <p style={{ fontSize: '0.75rem', marginTop: '1rem' }}>
                  Note: To implement a real scatter plot, a dedicated visualization library <br />
                  like D3.js or recharts would be required.
                </p>
                <div style={{ marginTop: '1rem' }}>
                  <Legend>
                    <LegendItem>
                      <LegendColor $color={qualityColors.improved} />
                      Improved Quality
                    </LegendItem>
                    <LegendItem>
                      <LegendColor $color={qualityColors.neutral} />
                      Neutral Impact
                    </LegendItem>
                    <LegendItem>
                      <LegendColor $color={qualityColors.needsRework} />
                      Needs Rework
                    </LegendItem>
                  </Legend>
                </div>
              </ScatterPlotContainer>
              
              <p style={{ fontSize: '0.875rem', color: '#718096', marginTop: '1rem' }}>
                The scatter plot would show the relationship between task complexity and time saved.
                Areas with clustered points indicate patterns where AI tools have consistent effects.
              </p>
            </Section>
          ) : (
            <Section>
              <SectionTitle>Time Saved vs. Complexity</SectionTitle>
              <NoDataMessage>No correlation data available.</NoDataMessage>
            </Section>
          )}
          
          <Section>
            <SectionTitle>Key Insights</SectionTitle>
            <div style={{ fontSize: '0.875rem', color: '#4a5568', lineHeight: '1.5' }}>
              {complexityData.length > 0 && qualityData.length > 0 ? (
                <>
                  {/* Logic to generate insights based on the data */}
                  <p>
                    <strong>Complexity Efficiency:</strong> AI tools save an average of {formatNumber(complexityData.find(d => d.level === 'high')?.averageHoursSaved || 0)} hours on high complexity tasks, 
                    compared to {formatNumber(complexityData.find(d => d.level === 'low')?.averageHoursSaved || 0)} hours on low complexity tasks.
                  </p>
                  <p>
                    <strong>Quality Distribution:</strong> {formatPercent((byQuality.improved?.count || 0) / totalTasks * 100)} of tasks show improved quality when using AI tools,
                    while only {formatPercent((byQuality.needsRework?.count || 0) / totalTasks * 100)} require rework.
                  </p>
                  <p>
                    <strong>Tool Effectiveness:</strong> The most effective tools for complex tasks are those that provide both time savings and quality improvements.
                  </p>
                </>
              ) : (
                <NoDataMessage>Insufficient data for insights.</NoDataMessage>
              )}
            </div>
          </Section>
        </>
      )}
    </ReportContainer>
  );
};

export default ComplexityQualityPresentation;