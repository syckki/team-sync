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

const KpiContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
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
  justify-content: space-between;
`;

const KpiLabel = styled.div`
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.5rem;
`;

const KpiValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #4e7fff;
`;

const ChartContainer = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
`;

// Simple bar chart implementation using divs
const BarChart = styled.div`
  display: flex;
  flex-direction: column;
  height: 200px;
  margin-top: 1rem;
`;

const BarChartContainer = styled.div`
  display: flex;
  height: 180px;
  align-items: flex-end;
  gap: 2px;
  margin-bottom: 0.5rem;
`;

const Bar = styled.div`
  background-color: #4e7fff;
  flex: 1;
  min-width: 20px;
  max-width: 60px;
  border-radius: 3px 3px 0 0;
  position: relative;
  height: ${props => `${props.$height}%`};
  
  &:hover {
    background-color: #3b5bdb;
  }
  
  &:hover::after {
    content: "${props => `${props.$label}: ${props.$value.toFixed(1)}hrs`}";
    position: absolute;
    bottom: calc(100% + 5px);
    left: 50%;
    transform: translateX(-50%);
    background-color: #2d3748;
    color: white;
    padding: 3px 6px;
    border-radius: 3px;
    font-size: 0.75rem;
    white-space: nowrap;
    z-index: 10;
  }
`;

const BarLabel = styled.div`
  font-size: 0.675rem;
  color: #718096;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  transform: rotate(-45deg);
  transform-origin: left top;
  position: absolute;
  bottom: -24px;
  left: 4px;
`;

const XAxis = styled.div`
  border-top: 1px solid #e2e8f0;
  position: relative;
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
const AiImpactSummaryPresentation = ({ summary }) => {
  const {
    totalTimeSaved,
    averageTimeSavedPerTask,
    totalTasks,
    averagePercentTimeSaved,
    timeByPeriod
  } = summary;

  // Format number with commas and 1 decimal place
  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: 1,
      maximumFractionDigits: 1 
    });
  };

  // Helper to format percentage
  const formatPercent = (num) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: 1,
      maximumFractionDigits: 1 
    }) + '%';
  };

  // Format period label for display
  const formatPeriodLabel = (periodKey) => {
    if (periodKey.includes('W')) {
      // Weekly format
      const [year, week] = periodKey.split('-W');
      return `W${week}`;
    } else if (periodKey.includes('Q')) {
      // Quarterly format
      return periodKey.split('-')[1];
    } else {
      // Monthly format
      const [year, month] = periodKey.split('-');
      return new Date(year, parseInt(month) - 1).toLocaleString('default', { month: 'short' });
    }
  };

  // Find the maximum value for scaling the chart
  const maxTotalTimeSaved = timeByPeriod.length > 0
    ? Math.max(...timeByPeriod.map(period => period.totalTimeSaved))
    : 0;

  return (
    <ReportContainer>
      <ReportTitle>Summary of AI's Overall Impact on Productivity</ReportTitle>
      
      <KpiContainer>
        <KpiCard>
          <KpiLabel>Total Time Saved</KpiLabel>
          <KpiValue>{formatNumber(totalTimeSaved)} hrs</KpiValue>
        </KpiCard>
        
        <KpiCard>
          <KpiLabel>Avg. Time Saved Per Task</KpiLabel>
          <KpiValue>{formatNumber(averageTimeSavedPerTask)} hrs</KpiValue>
        </KpiCard>
        
        <KpiCard>
          <KpiLabel>Total AI-Assisted Tasks</KpiLabel>
          <KpiValue>{totalTasks}</KpiValue>
        </KpiCard>
        
        <KpiCard>
          <KpiLabel>Avg. % Time Saved</KpiLabel>
          <KpiValue>{formatPercent(averagePercentTimeSaved)}</KpiValue>
        </KpiCard>
      </KpiContainer>
      
      <ChartContainer>
        <ChartTitle>Time Saved Trend</ChartTitle>
        
        {timeByPeriod.length > 0 ? (
          <BarChart>
            <BarChartContainer>
              {timeByPeriod.map((period, index) => (
                <Bar 
                  key={index} 
                  $height={(period.totalTimeSaved / maxTotalTimeSaved) * 100}
                  $label={period.period}
                  $value={period.totalTimeSaved}
                >
                  <BarLabel>{formatPeriodLabel(period.period)}</BarLabel>
                </Bar>
              ))}
            </BarChartContainer>
            <XAxis />
          </BarChart>
        ) : (
          <NoDataMessage>No trend data available for the selected filters.</NoDataMessage>
        )}
      </ChartContainer>
    </ReportContainer>
  );
};

export default AiImpactSummaryPresentation;