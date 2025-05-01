import React, { useState, useEffect, useMemo } from "react";
import ToolEffectivenessPresentation from "../../presentational/reports/ToolEffectivenessPresentation";

/**
 * Container component for the AI Tool Effectiveness Comparison report
 * Processes data related to which AI tools are generating the most time savings
 */
const ToolEffectivenessContainer = ({ reports, filters = {} }) => {
  // State to store processed tool data
  const [toolsData, setToolsData] = useState({
    toolsComparison: [],
    roleDistribution: {},
    taskDistribution: {},
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

      // Additional filters can be added here
      return true;
    });
  }, [reports, filters]);

  // Process data for the tool effectiveness report
  useEffect(() => {
    if (!filteredReports || !filteredReports.length) {
      setToolsData({
        toolsComparison: [],
        roleDistribution: {},
        taskDistribution: {},
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
      if (filters.sdlcStep && entry.sdlcStep !== filters.sdlcStep) {
        return false;
      }
      if (filters.sdlcTask && entry.sdlcTask !== filters.sdlcTask) {
        return false;
      }
      if (filters.platform && entry.platform !== filters.platform) {
        return false;
      }
      // Can add more filters here for taskCategory, etc.
      return true;
    });

    // Group entries by AI tool
    const toolGroups = {};
    filteredEntries.forEach(entry => {
      const toolName = entry.aiTool || 'Not Specified';
      
      if (!toolGroups[toolName]) {
        toolGroups[toolName] = {
          name: toolName,
          entries: [],
          totalSaved: 0,
          totalTasks: 0,
          averageSaved: 0,
          averageComplexity: 0,
          roles: {},
          tasks: {},
          sdlcSteps: {},
        };
      }
      
      // Add entry to this tool's data
      toolGroups[toolName].entries.push(entry);
      
      // Update totals
      toolGroups[toolName].totalSaved += parseFloat(entry.hoursSaved) || 0;
      toolGroups[toolName].totalTasks += 1;
      
      // Track role distribution
      const role = entry.teamRole || 'Not Specified';
      toolGroups[toolName].roles[role] = (toolGroups[toolName].roles[role] || 0) + 1;
      
      // Track task distribution
      const task = entry.sdlcTask || 'Not Specified';
      toolGroups[toolName].tasks[task] = (toolGroups[toolName].tasks[task] || 0) + 1;
      
      // Track SDLC step distribution
      const sdlcStep = entry.sdlcStep || 'Not Specified';
      toolGroups[toolName].sdlcSteps[sdlcStep] = (toolGroups[toolName].sdlcSteps[sdlcStep] || 0) + 1;
    });
    
    // Calculate averages and prepare final data
    const toolsComparison = Object.values(toolGroups).map(tool => {
      // Calculate average time saved
      const averageSaved = tool.totalTasks > 0 
        ? tool.totalSaved / tool.totalTasks 
        : 0;
        
      // Calculate average complexity - assuming complexity is a property in the entries
      // If complexity is on a scale of 1-5, for example
      const averageComplexity = tool.entries.reduce((sum, entry) => {
        const complexity = parseFloat(entry.complexity) || 0;
        return sum + complexity;
      }, 0) / (tool.totalTasks || 1);
      
      // Convert roles and tasks to arrays for easier sorting in the UI
      const rolesArray = Object.entries(tool.roles).map(([name, count]) => ({
        name,
        count,
        percentage: (count / tool.totalTasks) * 100
      })).sort((a, b) => b.count - a.count);
      
      const tasksArray = Object.entries(tool.tasks).map(([name, count]) => ({
        name,
        count,
        percentage: (count / tool.totalTasks) * 100
      })).sort((a, b) => b.count - a.count);
      
      const sdlcStepsArray = Object.entries(tool.sdlcSteps).map(([name, count]) => ({
        name,
        count,
        percentage: (count / tool.totalTasks) * 100
      })).sort((a, b) => b.count - a.count);
      
      return {
        name: tool.name,
        totalSaved: tool.totalSaved,
        totalTasks: tool.totalTasks,
        averageSaved,
        averageComplexity,
        roles: rolesArray,
        tasks: tasksArray,
        sdlcSteps: sdlcStepsArray
      };
    }).sort((a, b) => b.totalSaved - a.totalSaved); // Sort by total time saved
    
    // Create role distribution across tools
    const roleDistribution = {};
    toolsComparison.forEach(tool => {
      tool.roles.forEach(role => {
        if (!roleDistribution[role.name]) {
          roleDistribution[role.name] = {
            role: role.name,
            toolBreakdown: []
          };
        }
        
        roleDistribution[role.name].toolBreakdown.push({
          tool: tool.name,
          count: role.count,
          saved: (role.count / tool.totalTasks) * tool.totalSaved
        });
      });
    });
    
    // Create task distribution across tools
    const taskDistribution = {};
    toolsComparison.forEach(tool => {
      tool.tasks.forEach(task => {
        if (!taskDistribution[task.name]) {
          taskDistribution[task.name] = {
            task: task.name,
            toolBreakdown: []
          };
        }
        
        taskDistribution[task.name].toolBreakdown.push({
          tool: tool.name,
          count: task.count,
          saved: (task.count / tool.totalTasks) * tool.totalSaved
        });
      });
    });
    
    // Update state with processed data
    setToolsData({
      toolsComparison,
      roleDistribution: Object.values(roleDistribution)
        .sort((a, b) => {
          // Calculate total saved time for each role
          const aSaved = a.toolBreakdown.reduce((sum, item) => sum + item.saved, 0);
          const bSaved = b.toolBreakdown.reduce((sum, item) => sum + item.saved, 0);
          return bSaved - aSaved;
        }),
      taskDistribution: Object.values(taskDistribution)
        .sort((a, b) => {
          // Calculate total saved time for each task
          const aSaved = a.toolBreakdown.reduce((sum, item) => sum + item.saved, 0);
          const bSaved = b.toolBreakdown.reduce((sum, item) => sum + item.saved, 0);
          return bSaved - aSaved;
        })
    });
  }, [filteredReports, filters]);

  return (
    <ToolEffectivenessPresentation 
      toolsData={toolsData}
      filters={filters}
    />
  );
};

export default ToolEffectivenessContainer;