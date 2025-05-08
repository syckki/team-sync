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

const KpiCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const KpiCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
`;

const KpiLabel = styled.div`
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.5rem;
`;

const KpiValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
`;

const KpiSubtext = styled.div`
  font-size: 0.75rem;
  color: #a0aec0;
  margin-top: 0.25rem;
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
  height: 300px;
  margin-bottom: 1rem;
  position: relative;
`;

const BarChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 250px;
  gap: 0.5rem;
  padding-bottom: 2rem;
  margin-top: 1.5rem;
  position: relative;
`;

const BarGroup = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  gap: 0.25rem;
  align-items: flex-end;
`;

const BarColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Bar = styled.div`
  width: 100%;
  background-color: ${props => props.$color || '#4e7fff'};
  border-radius: 0.25rem;
  transition: height 0.3s ease;
  min-height: 4px;
  max-width: 60px;
  position: relative;
  
  &:hover {
    opacity: 0.9;
  }
`;

const BarLabel = styled.div`
  font-size: 0.7rem;
  color: #718096;
  margin-top: 0.5rem;
  text-align: center;
  transform: rotate(-45deg);
  transform-origin: top left;
  position: absolute;
  bottom: -24px;
  width: max-content;
  white-space: nowrap;
`;

const AxisLine = styled.div`
  position: absolute;
  background-color: #e2e8f0;
  
  &.x-axis {
    left: 0;
    right: 0;
    bottom: 30px;
    height: 1px;
  }
  
  &.y-axis {
    left: 0;
    top: 0;
    bottom: 30px;
    width: 1px;
  }
`;

const BarValue = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
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

const ProgressBar = styled.div`
  height: 0.5rem;
  background-color: #edf2f7;
  border-radius: 0.25rem;
  width: 100%;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #4e7fff;
  width: ${props => `${Math.min(props.$percentage, 100)}%`};
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-style: italic;
`;

/**
 * Presentation component for the AI Impact Summary report
 */
const AiImpactSummaryPresentation = ({ reportData, periodType }) => {
  const { summary, periodData, platformData, sdlcData } = reportData;
  
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
  
  // Find the maximum value for chart scaling
  const maxHoursSaved = Math.max(...periodData.map(period => period.totalHoursSaved), 1);
  
  // If no data is available
  if (summary.totalEntries === 0) {
    return (
      <ReportContainer>
        <ReportTitle>Summary of AI's Overall Impact on Productivity</ReportTitle>
        <NoDataMessage>No productivity data available for the selected filters.</NoDataMessage>
      </ReportContainer>
    );
  }

  return (
    <ReportContainer>
      <ReportTitle>Summary of AI's Overall Impact on Productivity</ReportTitle>
      
      {/* KPI Cards */}
      <KpiCardsGrid>
        <KpiCard>
          <KpiLabel>Total Time Spent</KpiLabel>
          <KpiValue>{formatNumber(summary.totalHours)} hrs</KpiValue>
          <KpiSubtext>Across {summary.totalEntries} tasks</KpiSubtext>
        </KpiCard>
        
        <KpiCard>
          <KpiLabel>Total Time Saved</KpiLabel>
          <KpiValue>{formatNumber(summary.totalHoursSaved)} hrs</KpiValue>
          <KpiSubtext>Using AI productivity tools</KpiSubtext>
        </KpiCard>
        
        <KpiCard>
          <KpiLabel>Average Time Saved Per Task</KpiLabel>
          <KpiValue>{formatNumber(summary.averageProductivity)} hrs</KpiValue>
          <KpiSubtext>Across all reported tasks</KpiSubtext>
        </KpiCard>
        
        <KpiCard>
          <KpiLabel>Productivity Ratio</KpiLabel>
          <KpiValue>{formatPercent(summary.productivityRatio)}</KpiValue>
          <KpiSubtext>Time saved vs. time spent</KpiSubtext>
        </KpiCard>
      </KpiCardsGrid>
      
      {/* Time Period Analysis */}
      <Section>
        <SectionTitle>Productivity Trends by {periodType.charAt(0).toUpperCase() + periodType.slice(1)}</SectionTitle>
        {periodData.length === 0 ? (
          <NoDataMessage>No period data available.</NoDataMessage>
        ) : (
          <>
            <BarChartContainer>
              <AxisLine className="x-axis" />
              <AxisLine className="y-axis" />
              
              <BarGroup>
                {periodData.map((period, index) => (
                  <BarColumn key={index}>
                    <BarValue>{formatNumber(period.totalHoursSaved)}</BarValue>
                    <Bar 
                      style={{ height: `${(period.totalHoursSaved / maxHoursSaved) * 100}%` }}
                      $color="#4e7fff"
                      title={`${period.period}: ${formatNumber(period.totalHoursSaved)} hrs saved (${formatPercent(period.productivityRatio)} productivity ratio)`}
                    />
                    <BarLabel>{period.period}</BarLabel>
                  </BarColumn>
                ))}
              </BarGroup>
            </BarChartContainer>
            
            <Table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Total Hours</th>
                  <th>Hours Saved</th>
                  <th>Tasks</th>
                  <th>Productivity</th>
                </tr>
              </thead>
              <tbody>
                {periodData.map((period, index) => (
                  <tr key={index}>
                    <td>{period.period}</td>
                    <td>{formatNumber(period.totalHours)}</td>
                    <td>{formatNumber(period.totalHoursSaved)}</td>
                    <td>{period.entryCount}</td>
                    <td>
                      {formatPercent(period.productivityRatio)}
                      <ProgressBar>
                        <ProgressFill $percentage={period.productivityRatio} />
                      </ProgressBar>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </Section>
      
      {/* Platform Analysis */}
      <Section>
        <SectionTitle>AI Productivity by Platform</SectionTitle>
        {platformData.length === 0 ? (
          <NoDataMessage>No platform data available.</NoDataMessage>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Platform</th>
                <th>Time Saved</th>
                <th>Total Hours</th>
                <th>Tasks</th>
                <th>Productivity</th>
              </tr>
            </thead>
            <tbody>
              {platformData.map((platform, index) => (
                <tr key={index}>
                  <td>{platform.platform}</td>
                  <td>{formatNumber(platform.totalHoursSaved)}</td>
                  <td>{formatNumber(platform.totalHours)}</td>
                  <td>{platform.entryCount}</td>
                  <td>
                    {formatPercent(platform.productivityRatio)}
                    <ProgressBar>
                      <ProgressFill $percentage={platform.productivityRatio} />
                    </ProgressBar>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
      
      {/* SDLC Analysis */}
      <Section>
        <SectionTitle>AI Productivity by SDLC Step</SectionTitle>
        {sdlcData.length === 0 ? (
          <NoDataMessage>No SDLC data available.</NoDataMessage>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>SDLC Step</th>
                <th>Time Saved</th>
                <th>Total Hours</th>
                <th>Tasks</th>
                <th>Productivity</th>
              </tr>
            </thead>
            <tbody>
              {sdlcData.map((sdlc, index) => (
                <tr key={index}>
                  <td>{sdlc.sdlcStep}</td>
                  <td>{formatNumber(sdlc.totalHoursSaved)}</td>
                  <td>{formatNumber(sdlc.totalHours)}</td>
                  <td>{sdlc.entryCount}</td>
                  <td>
                    {formatPercent(sdlc.productivityRatio)}
                    <ProgressBar>
                      <ProgressFill $percentage={sdlc.productivityRatio} />
                    </ProgressBar>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    </ReportContainer>
  );
};

export default AiImpactSummaryPresentation;