import React, { useState, useEffect, useMemo } from "react";
import SdlcAnalysisView from "../../views/reports/SdlcAnalysisView";

/**
 * Container component for the AI Impact on SDLC and Task Types report
 * Analyzes how AI tools affect different phases of the software development lifecycle
 */
const SdlcAnalysisViewModel = ({ reports, filters = {} }) => {
  // State to store processed data
  const [analysisData, setAnalysisData] = useState({
    sdlcPhaseAnalysis: [],
    sdlcTaskAnalysis: [],
    aiToolsBySdlcPhase: {},
    taskCategoryAnalysis: [],
    sankeyData: {
      nodes: [],
      links: []
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

  // Process data for the SDLC analysis report
  useEffect(() => {
    if (!filteredReports || !filteredReports.length) {
      setAnalysisData({
        sdlcPhaseAnalysis: [],
        sdlcTaskAnalysis: [],
        aiToolsBySdlcPhase: {},
        taskCategoryAnalysis: [],
        sankeyData: {
          nodes: [],
          links: []
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
      return true;
    });
    
    // Group data by SDLC phase (step)
    const sdlcPhaseData = {};
    // Group data by SDLC task
    const sdlcTaskData = {};
    // Group data by task category (derived from task details or description)
    const taskCategoryData = {};
    
    // AI Tools usage by SDLC phase
    const toolsBySdlcPhase = {};
    
    // Sankey diagram data
    const sankeyNodes = new Set();
    const sankeyLinks = {};
    
    // Process entries and group by SDLC phases and tasks
    filteredEntries.forEach(entry => {
      const sdlcPhase = entry.sdlcStep || 'Not Specified';
      const sdlcTask = entry.sdlcTask || 'Not Specified';
      const aiTool = entry.aiTool || 'Not Specified';
      
      // Attempt to derive a task category from the details or other fields
      // This could be enhanced with NLP categorization in the future
      let taskCategory = 'Other';
      const taskDetails = (entry.taskDetails || '').toLowerCase();
      
      // Simple rule-based categorization
      if (taskDetails.includes('test') || sdlcTask.toLowerCase().includes('test')) {
        taskCategory = 'Testing';
      } else if (taskDetails.includes('code') || taskDetails.includes('develop') || 
                sdlcTask.toLowerCase().includes('develop') || sdlcTask.toLowerCase().includes('code')) {
        taskCategory = 'Development';
      } else if (taskDetails.includes('design') || sdlcTask.toLowerCase().includes('design')) {
        taskCategory = 'Design';
      } else if (taskDetails.includes('requirement') || taskDetails.includes('spec') || 
                sdlcTask.toLowerCase().includes('requirement')) {
        taskCategory = 'Requirements';
      } else if (taskDetails.includes('document') || sdlcTask.toLowerCase().includes('document')) {
        taskCategory = 'Documentation';
      } else if (taskDetails.includes('plan') || taskDetails.includes('manage') || 
                sdlcTask.toLowerCase().includes('plan') || sdlcTask.toLowerCase().includes('manage')) {
        taskCategory = 'Project Management';
      } else if (taskDetails.includes('deploy') || taskDetails.includes('release') || 
                sdlcTask.toLowerCase().includes('deploy') || sdlcTask.toLowerCase().includes('release')) {
        taskCategory = 'Deployment';
      } else if (taskDetails.includes('review') || taskDetails.includes('inspect') || 
                sdlcTask.toLowerCase().includes('review')) {
        taskCategory = 'Code Review';
      } else if (taskDetails.includes('fix') || taskDetails.includes('bug') || 
                sdlcTask.toLowerCase().includes('fix') || sdlcTask.toLowerCase().includes('bug')) {
        taskCategory = 'Bug Fixing';
      } else if (taskDetails.includes('research') || taskDetails.includes('learn') || 
                sdlcTask.toLowerCase().includes('research')) {
        taskCategory = 'Research';
      }
      
      const hours = parseFloat(entry.hours) || 0;
      const hoursSaved = parseFloat(entry.hoursSaved) || 0;
      
      // Update SDLC phase data
      if (!sdlcPhaseData[sdlcPhase]) {
        sdlcPhaseData[sdlcPhase] = {
          phase: sdlcPhase,
          totalHours: 0,
          totalHoursSaved: 0,
          taskCount: 0,
          aiTools: {}
        };
      }
      
      sdlcPhaseData[sdlcPhase].totalHours += hours;
      sdlcPhaseData[sdlcPhase].totalHoursSaved += hoursSaved;
      sdlcPhaseData[sdlcPhase].taskCount += 1;
      
      // Track AI tools for this SDLC phase
      if (!sdlcPhaseData[sdlcPhase].aiTools[aiTool]) {
        sdlcPhaseData[sdlcPhase].aiTools[aiTool] = {
          tool: aiTool,
          hoursSaved: 0,
          usageCount: 0
        };
      }
      sdlcPhaseData[sdlcPhase].aiTools[aiTool].hoursSaved += hoursSaved;
      sdlcPhaseData[sdlcPhase].aiTools[aiTool].usageCount += 1;
      
      // Update SDLC task data
      if (!sdlcTaskData[sdlcTask]) {
        sdlcTaskData[sdlcTask] = {
          task: sdlcTask,
          phase: sdlcPhase,
          totalHours: 0,
          totalHoursSaved: 0,
          taskCount: 0,
          aiTools: {}
        };
      }
      
      sdlcTaskData[sdlcTask].totalHours += hours;
      sdlcTaskData[sdlcTask].totalHoursSaved += hoursSaved;
      sdlcTaskData[sdlcTask].taskCount += 1;
      
      // Track AI tools for this SDLC task
      if (!sdlcTaskData[sdlcTask].aiTools[aiTool]) {
        sdlcTaskData[sdlcTask].aiTools[aiTool] = {
          tool: aiTool,
          hoursSaved: 0,
          usageCount: 0
        };
      }
      sdlcTaskData[sdlcTask].aiTools[aiTool].hoursSaved += hoursSaved;
      sdlcTaskData[sdlcTask].aiTools[aiTool].usageCount += 1;
      
      // Update task category data
      if (!taskCategoryData[taskCategory]) {
        taskCategoryData[taskCategory] = {
          category: taskCategory,
          totalHours: 0,
          totalHoursSaved: 0,
          taskCount: 0,
          aiTools: {}
        };
      }
      
      taskCategoryData[taskCategory].totalHours += hours;
      taskCategoryData[taskCategory].totalHoursSaved += hoursSaved;
      taskCategoryData[taskCategory].taskCount += 1;
      
      // Track AI tools for this task category
      if (!taskCategoryData[taskCategory].aiTools[aiTool]) {
        taskCategoryData[taskCategory].aiTools[aiTool] = {
          tool: aiTool,
          hoursSaved: 0,
          usageCount: 0
        };
      }
      taskCategoryData[taskCategory].aiTools[aiTool].hoursSaved += hoursSaved;
      taskCategoryData[taskCategory].aiTools[aiTool].usageCount += 1;
      
      // Track AI tools by SDLC phase for the separate visualization
      if (!toolsBySdlcPhase[sdlcPhase]) {
        toolsBySdlcPhase[sdlcPhase] = {};
      }
      if (!toolsBySdlcPhase[sdlcPhase][aiTool]) {
        toolsBySdlcPhase[sdlcPhase][aiTool] = {
          hoursSaved: 0,
          usageCount: 0
        };
      }
      toolsBySdlcPhase[sdlcPhase][aiTool].hoursSaved += hoursSaved;
      toolsBySdlcPhase[sdlcPhase][aiTool].usageCount += 1;
      
      // Prepare data for Sankey diagram
      // Add nodes for AI tools and SDLC phases
      sankeyNodes.add(aiTool);
      sankeyNodes.add(sdlcPhase);
      
      // Track links between AI tools and SDLC phases
      const linkKey = `${aiTool}→${sdlcPhase}`;
      if (!sankeyLinks[linkKey]) {
        sankeyLinks[linkKey] = {
          source: aiTool,
          target: sdlcPhase,
          value: 0
        };
      }
      sankeyLinks[linkKey].value += hoursSaved;
    });
    
    // Convert to arrays and calculate averages for SDLC phase data
    const sdlcPhaseAnalysis = Object.values(sdlcPhaseData).map(phase => {
      // Convert aiTools object to sorted array
      const aiToolsArray = Object.values(phase.aiTools)
        .sort((a, b) => b.hoursSaved - a.hoursSaved);
      
      // Get the most effective tools (top 3)
      const mostEffectiveTools = aiToolsArray
        .slice(0, 3)
        .map(tool => tool.tool);
      
      return {
        ...phase,
        aiTools: aiToolsArray,
        mostEffectiveTools,
        averageHoursSaved: phase.taskCount > 0 
          ? phase.totalHoursSaved / phase.taskCount 
          : 0
      };
    }).sort((a, b) => b.totalHoursSaved - a.totalHoursSaved);
    
    // Convert to arrays and calculate averages for SDLC task data
    const sdlcTaskAnalysis = Object.values(sdlcTaskData).map(task => {
      // Convert aiTools object to sorted array
      const aiToolsArray = Object.values(task.aiTools)
        .sort((a, b) => b.hoursSaved - a.hoursSaved);
      
      // Get the most effective tools (top 3)
      const mostEffectiveTools = aiToolsArray
        .slice(0, 3)
        .map(tool => tool.tool);
      
      return {
        ...task,
        aiTools: aiToolsArray,
        mostEffectiveTools,
        averageHoursSaved: task.taskCount > 0 
          ? task.totalHoursSaved / task.taskCount 
          : 0
      };
    }).sort((a, b) => b.totalHoursSaved - a.totalHoursSaved);
    
    // Convert to arrays and calculate averages for task category data
    const taskCategoryAnalysis = Object.values(taskCategoryData).map(category => {
      // Convert aiTools object to sorted array
      const aiToolsArray = Object.values(category.aiTools)
        .sort((a, b) => b.hoursSaved - a.hoursSaved);
      
      // Get the most effective tools (top 3)
      const mostEffectiveTools = aiToolsArray
        .slice(0, 3)
        .map(tool => tool.tool);
      
      return {
        ...category,
        aiTools: aiToolsArray,
        mostEffectiveTools,
        averageHoursSaved: category.taskCount > 0 
          ? category.totalHoursSaved / category.taskCount 
          : 0
      };
    }).sort((a, b) => b.totalHoursSaved - a.totalHoursSaved);
    
    // Process tools by SDLC phase for visualization
    const aiToolsBySdlcPhase = {};
    Object.entries(toolsBySdlcPhase).forEach(([phase, tools]) => {
      aiToolsBySdlcPhase[phase] = Object.entries(tools).map(([tool, stats]) => ({
        tool,
        hoursSaved: stats.hoursSaved,
        usageCount: stats.usageCount
      })).sort((a, b) => b.hoursSaved - a.hoursSaved);
    });
    
    // Prepare Sankey diagram data in the format expected by visualization libraries
    const sankeyData = {
      nodes: Array.from(sankeyNodes).map(id => ({ id })),
      links: Object.values(sankeyLinks)
        .filter(link => link.value > 0) // Filter out links with no value
        .map(link => ({
          source: link.source,
          target: link.target,
          value: Math.max(0.1, link.value) // Ensure minimum visibility
        }))
    };
    
    // Update state with processed data
    setAnalysisData({
      sdlcPhaseAnalysis,
      sdlcTaskAnalysis,
      aiToolsBySdlcPhase,
      taskCategoryAnalysis,
      sankeyData
    });
  }, [filteredReports, filters]);

  return (
    <SdlcAnalysisView 
      analysisData={analysisData}
      filters={filters}
    />
  );
};

export default SdlcAnalysisViewModel;