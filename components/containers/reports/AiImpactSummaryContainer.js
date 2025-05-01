import React, { useState, useEffect, useMemo } from "react";
import AiImpactSummaryPresentation from "../../presentational/reports/AiImpactSummaryPresentation";

/**
 * Container component for the AI Impact Summary report
 * Processes the raw report data and prepares it for presentation
 */
const AiImpactSummaryContainer = ({ reports, filters = {} }) => {
  // State for storing processed data
  const [summary, setSummary] = useState({
    totalTimeSaved: 0,
    averageTimeSavedPerTask: 0,
    totalTasks: 0,
    averagePercentTimeSaved: 0,
    timeByPeriod: [],
  });

  // Filter reports based on selected criteria
  const filteredReports = useMemo(() => {
    if (!reports || !reports.length) return [];

    return reports.filter(report => {
      // Filter by team member if specified
      if (filters.teamMember && report.teamMember !== filters.teamMember) {
        return false;
      }

      // Filter by role if specified
      if (filters.teamRole && report.teamRole !== filters.teamRole) {
        return false;
      }

      // Filter by platform if specified (this would need to look at entries)
      if (filters.platform) {
        // Only keep reports that have at least one entry matching the platform
        const hasMatchingPlatform = report.entries.some(entry => 
          entry.platform === filters.platform
        );
        if (!hasMatchingPlatform) return false;
      }

      // Additional filters can be added here
      return true;
    });
  }, [reports, filters]);

  // Process data for the summary whenever filtered reports change
  useEffect(() => {
    if (!filteredReports || !filteredReports.length) {
      setSummary({
        totalTimeSaved: 0,
        averageTimeSavedPerTask: 0,
        totalTasks: 0,
        averagePercentTimeSaved: 0,
        timeByPeriod: [],
      });
      return;
    }

    // Extract and flatten all report entries
    const allEntries = filteredReports.flatMap(report => 
      report.entries.map(entry => ({
        ...entry,
        timestamp: report.timestamp,
        teamMember: report.teamMember,
        teamRole: report.teamRole
      }))
    );

    // Calculate total time saved
    const totalTimeSaved = allEntries.reduce(
      (sum, entry) => sum + (parseFloat(entry.hoursSaved) || 0),
      0
    );

    // Calculate total tasks
    const totalTasks = allEntries.length;

    // Calculate average time saved per task
    const averageTimeSavedPerTask = totalTasks > 0 
      ? totalTimeSaved / totalTasks 
      : 0;

    // Calculate average percentage of time saved
    // (hoursSaved / estimatedTimeWithoutAI) * 100
    const percentages = allEntries.map(entry => {
      const estimated = parseFloat(entry.estimatedTimeWithoutAI) || 0;
      const saved = parseFloat(entry.hoursSaved) || 0;
      return estimated > 0 ? (saved / estimated) * 100 : 0;
    });

    const averagePercentTimeSaved = percentages.length > 0
      ? percentages.reduce((sum, percent) => sum + percent, 0) / percentages.length
      : 0;

    // Group entries by week or period for trend analysis
    const timeByPeriod = groupEntriesByPeriod(allEntries, filters.periodType || 'week');

    setSummary({
      totalTimeSaved,
      averageTimeSavedPerTask,
      totalTasks,
      averagePercentTimeSaved,
      timeByPeriod,
    });
  }, [filteredReports, filters.periodType]);

  /**
   * Group entries by period (week, month, quarter) for trend analysis
   */
  const groupEntriesByPeriod = (entries, periodType) => {
    const periods = {};

    entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      let periodKey;

      switch (periodType) {
        case 'month':
          // Format: YYYY-MM
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarter':
          // Calculate quarter (0-based months: 0,1,2=Q1; 3,4,5=Q2; etc.)
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          periodKey = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'week':
        default:
          // Get ISO week number
          const startOfYear = new Date(date.getFullYear(), 0, 1);
          const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
          const weekNumber = Math.ceil((date.getDay() + 1 + days) / 7);
          periodKey = `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
          break;
      }

      if (!periods[periodKey]) {
        periods[periodKey] = {
          period: periodKey,
          totalTimeSaved: 0,
          taskCount: 0,
          averageTimeSaved: 0
        };
      }

      periods[periodKey].totalTimeSaved += parseFloat(entry.hoursSaved) || 0;
      periods[periodKey].taskCount += 1;
    });

    // Calculate averages and convert to array sorted by period
    return Object.values(periods)
      .map(period => ({
        ...period,
        averageTimeSaved: period.taskCount > 0 
          ? period.totalTimeSaved / period.taskCount 
          : 0
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  };

  return (
    <AiImpactSummaryPresentation 
      summary={summary}
      filters={filters}
    />
  );
};

export default AiImpactSummaryContainer;