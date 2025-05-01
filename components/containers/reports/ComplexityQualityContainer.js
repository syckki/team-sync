import React, { useState, useEffect, useMemo } from "react";
import ComplexityQualityPresentation from "../../presentational/reports/ComplexityQualityPresentation";

/**
 * Container component for the Cross-Analysis of Time Saved vs. Task Complexity and Quality Impact report
 * Analyzes how AI time savings correlate with task complexity and quality outcomes
 */
const ComplexityQualityContainer = ({ reports, filters = {} }) => {
  // State to store processed data
  const [analysisData, setAnalysisData] = useState({
    byComplexity: {
      low: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] },
      medium: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] },
      high: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] }
    },
    byQuality: {
      improved: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] },
      neutral: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] },
      needsRework: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] }
    },
    timeVsComplexity: [],
    qualityByTimeSaved: {
      low: { improved: 0, neutral: 0, needsRework: 0 },
      medium: { improved: 0, neutral: 0, needsRework: 0 },
      high: { improved: 0, neutral: 0, needsRework: 0 }
    },
    toolsByComplexity: {},
    toolsByQuality: {},
    complexityBreakdowns: {
      bySDLC: {},
      byRole: {},
      byTool: {}
    }
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

      // Additional filters can be applied here
      return true;
    });
  }, [reports, filters]);

  // Process data for the complexity and quality analysis report
  useEffect(() => {
    if (!filteredReports || !filteredReports.length) {
      // Reset data if no reports are available
      setAnalysisData({
        byComplexity: {
          low: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] },
          medium: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] },
          high: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] }
        },
        byQuality: {
          improved: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] },
          neutral: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] },
          needsRework: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] }
        },
        timeVsComplexity: [],
        qualityByTimeSaved: {
          low: { improved: 0, neutral: 0, needsRework: 0 },
          medium: { improved: 0, neutral: 0, needsRework: 0 },
          high: { improved: 0, neutral: 0, needsRework: 0 }
        },
        toolsByComplexity: {},
        toolsByQuality: {},
        complexityBreakdowns: {
          bySDLC: {},
          byRole: {},
          byTool: {}
        }
      });
      return;
    }

    // Extract all entries from all reports
    const allEntries = filteredReports.flatMap(report => 
      report.entries.map(entry => ({
        ...entry,
        teamMember: report.teamMember,
        teamRole: report.teamRole,
        timestamp: report.timestamp
      }))
    );

    // Filter entries based on additional criteria in filters
    const filteredEntries = allEntries.filter(entry => {
      if (filters.aiTool && entry.aiTool !== filters.aiTool) {
        return false;
      }
      if (filters.sdlcStep && entry.sdlcStep !== filters.sdlcStep) {
        return false;
      }
      if (filters.sdlcTask && entry.sdlcTask !== filters.sdlcTask) {
        return false;
      }
      if (filters.platform && entry.platform !== filters.platform) {
        return false;
      }
      // Additional filters can be applied here
      return true;
    });
    
    // Determine complexity and quality levels
    // For this implementation, we'll derive them from existing fields where possible
    // In a real application, these would be explicit form fields
    const processedEntries = filteredEntries.map(entry => {
      // Derive complexity level from existing fields
      let complexity = 'medium'; // Default
      
      // Check if there's a complexity indicator in the data
      if (entry.complexity) {
        const complexityValue = typeof entry.complexity === 'string' 
          ? entry.complexity.toLowerCase() 
          : entry.complexity;
          
        if (typeof complexityValue === 'string') {
          if (complexityValue.includes('low') || complexityValue.includes('simple') || complexityValue === '1') {
            complexity = 'low';
          } else if (complexityValue.includes('high') || complexityValue.includes('complex') || complexityValue === '3') {
            complexity = 'high';
          } else {
            complexity = 'medium';
          }
        } else if (typeof complexityValue === 'number') {
          // Assume 1-3 scale or 1-5 scale
          if (complexityValue <= 1.5 || (complexityValue <= 2 && complexityValue <= 5)) {
            complexity = 'low';
          } else if (complexityValue >= 2.5 || (complexityValue >= 4 && complexityValue <= 5)) {
            complexity = 'high';
          } else {
            complexity = 'medium';
          }
        }
      } else {
        // If no explicit complexity field, attempt to derive from other fields
        const taskDetails = (entry.taskDetails || '').toLowerCase();
        
        // Keywords that might indicate complexity
        if (taskDetails.includes('simple') || taskDetails.includes('easy') || 
            taskDetails.includes('straightforward') || taskDetails.includes('basic')) {
          complexity = 'low';
        } else if (taskDetails.includes('complex') || taskDetails.includes('difficult') || 
                  taskDetails.includes('challenging') || taskDetails.includes('advanced')) {
          complexity = 'high';
        }
        
        // Hours spent could also be an indicator of complexity
        const hours = parseFloat(entry.hours) || 0;
        if (hours < 2) {
          // Short tasks are more likely to be simple
          // But don't downgrade if we already determined it's complex
          if (complexity !== 'high') complexity = 'low';
        } else if (hours > 6) {
          // Longer tasks are more likely to be complex
          // But don't upgrade if we already determined it's simple
          if (complexity !== 'low') complexity = 'high';
        }
      }
      
      // Derive quality impact from existing fields
      let qualityImpact = 'neutral'; // Default
      
      // Check if there's a quality indicator in the data
      if (entry.qualityImpact) {
        const qualityValue = typeof entry.qualityImpact === 'string' 
          ? entry.qualityImpact.toLowerCase() 
          : entry.qualityImpact;
          
        if (typeof qualityValue === 'string') {
          if (qualityValue.includes('improve') || qualityValue.includes('better') || 
              qualityValue.includes('enhanced') || qualityValue === 'good') {
            qualityImpact = 'improved';
          } else if (qualityValue.includes('rework') || qualityValue.includes('poor') || 
                    qualityValue.includes('issue') || qualityValue.includes('fix') || 
                    qualityValue === 'bad') {
            qualityImpact = 'needsRework';
          } else {
            qualityImpact = 'neutral';
          }
        } else if (typeof qualityValue === 'number') {
          // Assume 1-3 scale or 1-5 scale
          if (qualityValue >= 2.5 || (qualityValue >= 4 && qualityValue <= 5)) {
            qualityImpact = 'improved';
          } else if (qualityValue <= 1.5 || (qualityValue <= 2 && qualityValue <= 5)) {
            qualityImpact = 'needsRework';
          } else {
            qualityImpact = 'neutral';
          }
        }
      } else {
        // If no explicit quality field, attempt to derive from other fields
        const taskDetails = (entry.taskDetails || '').toLowerCase();
        const aiProductivity = (entry.aiProductivity || '').toLowerCase();
        
        // Keywords that might indicate quality
        if ((taskDetails.includes('better quality') || taskDetails.includes('improved quality') || 
            taskDetails.includes('enhanced quality') || taskDetails.includes('higher quality')) ||
            (aiProductivity.includes('better quality') || aiProductivity.includes('improved quality'))) {
          qualityImpact = 'improved';
        } else if ((taskDetails.includes('rework') || taskDetails.includes('fix') || 
                  taskDetails.includes('issue') || taskDetails.includes('problem')) ||
                  (aiProductivity.includes('needs review') || aiProductivity.includes('requires fixes'))) {
          qualityImpact = 'needsRework';
        }
      }
      
      return {
        ...entry,
        complexity,
        qualityImpact,
        hours: parseFloat(entry.hours) || 0,
        hoursSaved: parseFloat(entry.hoursSaved) || 0
      };
    });
    
    // Group by complexity
    const byComplexity = {
      low: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] },
      medium: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] },
      high: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] }
    };
    
    // Group by quality impact
    const byQuality = {
      improved: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] },
      neutral: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] },
      needsRework: { count: 0, totalHoursSaved: 0, totalHours: 0, averageHoursSaved: 0, tasks: [] }
    };
    
    // Data for scatter plot of time saved vs complexity
    const timeVsComplexity = [];
    
    // Tool usage by complexity and quality
    const toolsByComplexity = {
      low: {},
      medium: {},
      high: {}
    };
    
    const toolsByQuality = {
      improved: {},
      neutral: {},
      needsRework: {}
    };
    
    // Complex breakdown structures
    const complexityBreakdowns = {
      bySDLC: {},
      byRole: {},
      byTool: {}
    };
    
    // Categorize time saved as low, medium, or high
    const timeSavedCategories = {};
    
    // Process each entry to populate our data structures
    processedEntries.forEach(entry => {
      const { complexity, qualityImpact, hours, hoursSaved, aiTool = 'Not Specified', sdlcStep = 'Not Specified', teamRole = 'Not Specified' } = entry;
      
      // Update complexity groups
      byComplexity[complexity].count += 1;
      byComplexity[complexity].totalHours += hours;
      byComplexity[complexity].totalHoursSaved += hoursSaved;
      byComplexity[complexity].tasks.push(entry);
      
      // Update quality impact groups
      byQuality[qualityImpact].count += 1;
      byQuality[qualityImpact].totalHours += hours;
      byQuality[qualityImpact].totalHoursSaved += hoursSaved;
      byQuality[qualityImpact].tasks.push(entry);
      
      // Add data point for time vs complexity scatter plot
      // For complexity, map 'low', 'medium', 'high' to numerical values (1, 2, 3)
      const complexityValue = complexity === 'low' ? 1 : complexity === 'medium' ? 2 : 3;
      timeVsComplexity.push({
        complexity: complexityValue,
        hoursSaved,
        hours,
        qualityImpact,
        details: entry.taskDetails,
        aiTool,
        sdlcStep
      });
      
      // Track tool usage by complexity
      if (!toolsByComplexity[complexity][aiTool]) {
        toolsByComplexity[complexity][aiTool] = {
          tool: aiTool,
          count: 0,
          totalHoursSaved: 0
        };
      }
      toolsByComplexity[complexity][aiTool].count += 1;
      toolsByComplexity[complexity][aiTool].totalHoursSaved += hoursSaved;
      
      // Track tool usage by quality impact
      if (!toolsByQuality[qualityImpact][aiTool]) {
        toolsByQuality[qualityImpact][aiTool] = {
          tool: aiTool,
          count: 0,
          totalHoursSaved: 0
        };
      }
      toolsByQuality[qualityImpact][aiTool].count += 1;
      toolsByQuality[qualityImpact][aiTool].totalHoursSaved += hoursSaved;
      
      // Track complexity by SDLC step
      if (!complexityBreakdowns.bySDLC[sdlcStep]) {
        complexityBreakdowns.bySDLC[sdlcStep] = {
          step: sdlcStep,
          low: 0,
          medium: 0,
          high: 0,
          totalHoursSaved: 0
        };
      }
      complexityBreakdowns.bySDLC[sdlcStep][complexity] += 1;
      complexityBreakdowns.bySDLC[sdlcStep].totalHoursSaved += hoursSaved;
      
      // Track complexity by role
      if (!complexityBreakdowns.byRole[teamRole]) {
        complexityBreakdowns.byRole[teamRole] = {
          role: teamRole,
          low: 0,
          medium: 0,
          high: 0,
          totalHoursSaved: 0
        };
      }
      complexityBreakdowns.byRole[teamRole][complexity] += 1;
      complexityBreakdowns.byRole[teamRole].totalHoursSaved += hoursSaved;
      
      // Track complexity by tool
      if (!complexityBreakdowns.byTool[aiTool]) {
        complexityBreakdowns.byTool[aiTool] = {
          tool: aiTool,
          low: 0,
          medium: 0,
          high: 0,
          totalHoursSaved: 0
        };
      }
      complexityBreakdowns.byTool[aiTool][complexity] += 1;
      complexityBreakdowns.byTool[aiTool].totalHoursSaved += hoursSaved;
      
      // Categorize the hours saved as low, medium, or high
      // We'll determine the thresholds based on the data distribution
      // For simplicity in this implementation, we'll categorize later after we know the distribution
      timeSavedCategories[entry.id] = {
        hoursSaved,
        qualityImpact
      };
    });
    
    // Calculate averages
    Object.keys(byComplexity).forEach(key => {
      byComplexity[key].averageHoursSaved = byComplexity[key].count > 0 
        ? byComplexity[key].totalHoursSaved / byComplexity[key].count 
        : 0;
    });
    
    Object.keys(byQuality).forEach(key => {
      byQuality[key].averageHoursSaved = byQuality[key].count > 0 
        ? byQuality[key].totalHoursSaved / byQuality[key].count 
        : 0;
    });
    
    // Determine thresholds for time saved categories
    // For simplicity, we'll use equal thirds
    const allHoursSaved = Object.values(timeSavedCategories).map(item => item.hoursSaved).sort((a, b) => a - b);
    const lowThreshold = allHoursSaved.length > 0 
      ? allHoursSaved[Math.floor(allHoursSaved.length / 3)] 
      : 1;
    const highThreshold = allHoursSaved.length > 0 
      ? allHoursSaved[Math.floor(allHoursSaved.length * 2 / 3)] 
      : 3;
    
    // Calculate quality impact distribution by time saved category
    const qualityByTimeSaved = {
      low: { improved: 0, neutral: 0, needsRework: 0 },
      medium: { improved: 0, neutral: 0, needsRework: 0 },
      high: { improved: 0, neutral: 0, needsRework: 0 }
    };
    
    Object.values(timeSavedCategories).forEach(({ hoursSaved, qualityImpact }) => {
      let category;
      if (hoursSaved < lowThreshold) {
        category = 'low';
      } else if (hoursSaved > highThreshold) {
        category = 'high';
      } else {
        category = 'medium';
      }
      
      qualityByTimeSaved[category][qualityImpact] += 1;
    });
    
    // Convert tool usage objects to sorted arrays
    const toolsByComplexityArray = {};
    Object.keys(toolsByComplexity).forEach(complexity => {
      toolsByComplexityArray[complexity] = Object.values(toolsByComplexity[complexity])
        .sort((a, b) => b.totalHoursSaved - a.totalHoursSaved);
    });
    
    const toolsByQualityArray = {};
    Object.keys(toolsByQuality).forEach(quality => {
      toolsByQualityArray[quality] = Object.values(toolsByQuality[quality])
        .sort((a, b) => b.totalHoursSaved - a.totalHoursSaved);
    });
    
    // Convert complexity breakdowns to sorted arrays
    const complexityBreakdownsArray = {
      bySDLC: Object.values(complexityBreakdowns.bySDLC)
        .sort((a, b) => b.totalHoursSaved - a.totalHoursSaved),
      byRole: Object.values(complexityBreakdowns.byRole)
        .sort((a, b) => b.totalHoursSaved - a.totalHoursSaved),
      byTool: Object.values(complexityBreakdowns.byTool)
        .sort((a, b) => b.totalHoursSaved - a.totalHoursSaved)
    };
    
    // Update state with processed data
    setAnalysisData({
      byComplexity,
      byQuality,
      timeVsComplexity,
      qualityByTimeSaved,
      toolsByComplexity: toolsByComplexityArray,
      toolsByQuality: toolsByQualityArray,
      complexityBreakdowns: complexityBreakdownsArray,
      timeSavedThresholds: {
        low: lowThreshold,
        high: highThreshold
      }
    });
  }, [filteredReports, filters]);

  return (
    <ComplexityQualityPresentation 
      analysisData={analysisData}
      filters={filters}
    />
  );
};

export default ComplexityQualityContainer;