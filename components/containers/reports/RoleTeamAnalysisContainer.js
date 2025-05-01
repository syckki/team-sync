import React, { useState, useEffect, useMemo } from "react";
import RoleTeamAnalysisPresentation from "../../presentational/reports/RoleTeamAnalysisPresentation";

/**
 * Container component for the Productivity Analysis by Role and Team report
 * Analyzes how different roles and teams are adopting and benefiting from AI tools
 */
const RoleTeamAnalysisContainer = ({ reports, filters = {} }) => {
  // State to store processed data
  const [analysisData, setAnalysisData] = useState({
    roleAnalysis: [],
    teamMemberAnalysis: [],
    adoptionRates: {
      byRole: [],
      byTeam: []
    },
    aiToolUsage: {
      byRole: {},
      byTeam: {}
    }
  });
  
  // Get a list of all unique roles and team members from the reports
  const { allRoles, allTeamMembers, allTeamNames } = useMemo(() => {
    if (!reports || !reports.length) {
      return { 
        allRoles: [], 
        allTeamMembers: [],
        allTeamNames: new Set()
      };
    }
    
    const roles = new Set();
    const teamMembers = new Set();
    const teamNames = new Set();
    
    reports.forEach(report => {
      if (report.teamRole) roles.add(report.teamRole);
      if (report.teamMember) teamMembers.add(report.teamMember);
      
      // Extract team name from teamName field or from the first part of the teamMember name
      const teamName = report.teamName || 
        (report.teamMember ? report.teamMember.split(' ')[0] : 'Unknown');
      
      teamNames.add(teamName);
    });
    
    return { 
      allRoles: Array.from(roles), 
      allTeamMembers: Array.from(teamMembers),
      allTeamNames: teamNames
    };
  }, [reports]);
  
  // Filter reports based on selected criteria
  const filteredReports = useMemo(() => {
    if (!reports || !reports.length) return [];

    return reports.filter(report => {
      // If AI Tool filter is applied, check if any entry in the report uses that tool
      if (filters.aiTool) {
        const hasMatchingEntry = report.entries.some(entry => 
          entry.aiTool === filters.aiTool
        );
        if (!hasMatchingEntry) return false;
      }

      // If platform filter is applied, check if any entry in the report uses that platform
      if (filters.platform) {
        const hasMatchingEntry = report.entries.some(entry => 
          entry.platform === filters.platform
        );
        if (!hasMatchingEntry) return false;
      }

      // Additional filters can be applied here
      return true;
    });
  }, [reports, filters]);

  // Process data for the role and team analysis report
  useEffect(() => {
    if (!filteredReports || !filteredReports.length) {
      setAnalysisData({
        roleAnalysis: [],
        teamMemberAnalysis: [],
        adoptionRates: {
          byRole: [],
          byTeam: []
        },
        aiToolUsage: {
          byRole: {},
          byTeam: {}
        }
      });
      return;
    }

    // Group data by role
    const roleData = {};
    const teamMemberData = {};
    const teamData = {};
    
    // Tool usage tracking
    const roleToolUsage = {};
    const teamToolUsage = {};
    
    // For each report, extract and group data
    filteredReports.forEach(report => {
      const role = report.teamRole || 'Not Specified';
      const teamMember = report.teamMember || 'Not Specified';
      const teamName = report.teamName || 
        (report.teamMember ? report.teamMember.split(' ')[0] : 'Unknown');
      
      // Initialize role data if not exists
      if (!roleData[role]) {
        roleData[role] = {
          role,
          totalHours: 0,
          totalHoursSaved: 0,
          totalTasks: 0,
          teamMembers: new Set(),
          aiTools: {}
        };
      }
      
      // Initialize team member data if not exists
      if (!teamMemberData[teamMember]) {
        teamMemberData[teamMember] = {
          teamMember,
          role,
          totalHours: 0,
          totalHoursSaved: 0,
          totalTasks: 0,
          aiTools: {}
        };
      }
      
      // Initialize team data if not exists
      if (!teamData[teamName]) {
        teamData[teamName] = {
          team: teamName,
          totalHours: 0,
          totalHoursSaved: 0,
          totalTasks: 0,
          teamMembers: new Set(),
          aiTools: {}
        };
      }
      
      // Add this team member to both role and team sets
      roleData[role].teamMembers.add(teamMember);
      teamData[teamName].teamMembers.add(teamMember);
      
      // Process each entry in the report
      report.entries.forEach(entry => {
        const hours = parseFloat(entry.hours) || 0;
        const hoursSaved = parseFloat(entry.hoursSaved) || 0;
        const aiTool = entry.aiTool || 'Not Specified';
        
        // Update role totals
        roleData[role].totalHours += hours;
        roleData[role].totalHoursSaved += hoursSaved;
        roleData[role].totalTasks += 1;
        
        // Update team member totals
        teamMemberData[teamMember].totalHours += hours;
        teamMemberData[teamMember].totalHoursSaved += hoursSaved;
        teamMemberData[teamMember].totalTasks += 1;
        
        // Update team totals
        teamData[teamName].totalHours += hours;
        teamData[teamName].totalHoursSaved += hoursSaved;
        teamData[teamName].totalTasks += 1;
        
        // Track AI tool usage by role
        if (!roleData[role].aiTools[aiTool]) {
          roleData[role].aiTools[aiTool] = {
            tool: aiTool,
            hoursSaved: 0,
            usageCount: 0
          };
        }
        roleData[role].aiTools[aiTool].hoursSaved += hoursSaved;
        roleData[role].aiTools[aiTool].usageCount += 1;
        
        // Track AI tool usage by team member
        if (!teamMemberData[teamMember].aiTools[aiTool]) {
          teamMemberData[teamMember].aiTools[aiTool] = {
            tool: aiTool,
            hoursSaved: 0,
            usageCount: 0
          };
        }
        teamMemberData[teamMember].aiTools[aiTool].hoursSaved += hoursSaved;
        teamMemberData[teamMember].aiTools[aiTool].usageCount += 1;
        
        // Track AI tool usage by team
        if (!teamData[teamName].aiTools[aiTool]) {
          teamData[teamName].aiTools[aiTool] = {
            tool: aiTool,
            hoursSaved: 0,
            usageCount: 0
          };
        }
        teamData[teamName].aiTools[aiTool].hoursSaved += hoursSaved;
        teamData[teamName].aiTools[aiTool].usageCount += 1;
        
        // Aggregate tool usage stats for roles and teams
        // For roles
        if (!roleToolUsage[role]) {
          roleToolUsage[role] = {};
        }
        if (!roleToolUsage[role][aiTool]) {
          roleToolUsage[role][aiTool] = {
            hoursSaved: 0,
            usageCount: 0
          };
        }
        roleToolUsage[role][aiTool].hoursSaved += hoursSaved;
        roleToolUsage[role][aiTool].usageCount += 1;
        
        // For teams
        if (!teamToolUsage[teamName]) {
          teamToolUsage[teamName] = {};
        }
        if (!teamToolUsage[teamName][aiTool]) {
          teamToolUsage[teamName][aiTool] = {
            hoursSaved: 0,
            usageCount: 0
          };
        }
        teamToolUsage[teamName][aiTool].hoursSaved += hoursSaved;
        teamToolUsage[teamName][aiTool].usageCount += 1;
      });
    });
    
    // Convert to array and calculate averages for role data
    const roleAnalysis = Object.values(roleData).map(role => {
      // Convert aiTools object to sorted array
      const aiToolsArray = Object.values(role.aiTools)
        .sort((a, b) => b.hoursSaved - a.hoursSaved);
      
      // Get the most used tools (top 3)
      const mostUsedTools = aiToolsArray
        .slice(0, 3)
        .map(tool => tool.tool);
      
      return {
        ...role,
        aiTools: aiToolsArray,
        mostUsedTools,
        teamMemberCount: role.teamMembers.size,
        averageHoursSaved: role.totalTasks > 0 
          ? role.totalHoursSaved / role.totalTasks 
          : 0,
        teamMembers: Array.from(role.teamMembers)
      };
    }).sort((a, b) => b.totalHoursSaved - a.totalHoursSaved);
    
    // Convert to array and calculate averages for team member data
    const teamMemberAnalysis = Object.values(teamMemberData).map(member => {
      // Convert aiTools object to sorted array
      const aiToolsArray = Object.values(member.aiTools)
        .sort((a, b) => b.hoursSaved - a.hoursSaved);
      
      // Get the most used tools (top 3)
      const mostUsedTools = aiToolsArray
        .slice(0, 3)
        .map(tool => tool.tool);
      
      return {
        ...member,
        aiTools: aiToolsArray,
        mostUsedTools,
        averageHoursSaved: member.totalTasks > 0 
          ? member.totalHoursSaved / member.totalTasks 
          : 0
      };
    }).sort((a, b) => b.totalHoursSaved - a.totalHoursSaved);
    
    // Convert to array and calculate averages for team data
    const teamAnalysis = Object.values(teamData).map(team => {
      // Convert aiTools object to sorted array
      const aiToolsArray = Object.values(team.aiTools)
        .sort((a, b) => b.hoursSaved - a.hoursSaved);
      
      // Get the most used tools (top 3)
      const mostUsedTools = aiToolsArray
        .slice(0, 3)
        .map(tool => tool.tool);
      
      return {
        ...team,
        aiTools: aiToolsArray,
        mostUsedTools,
        teamMemberCount: team.teamMembers.size,
        averageHoursSaved: team.totalTasks > 0 
          ? team.totalHoursSaved / team.totalTasks 
          : 0,
        teamMembers: Array.from(team.teamMembers)
      };
    }).sort((a, b) => b.totalHoursSaved - a.totalHoursSaved);
    
    // Calculate adoption rates
    // By role - percentage of team members in each role using AI
    const adoptionRatesByRole = roleAnalysis.map(role => {
      // For this calculation, we'd need to know the total number of team members in this role
      // Since we don't have that data, we'll use what we have
      const adoptionRate = Math.min(100, (role.teamMemberCount / allTeamMembers.length) * 100);
      
      return {
        role: role.role,
        teamMemberCount: role.teamMemberCount,
        adoptionRate,
        totalHoursSaved: role.totalHoursSaved
      };
    }).sort((a, b) => b.adoptionRate - a.adoptionRate);
    
    // By team - percentage of team members in each team using AI
    const adoptionRatesByTeam = teamAnalysis.map(team => {
      // Estimate the total size of the team
      // This is just an approximation - in a real app, you'd have actual team sizes
      const totalTeamSize = Math.max(team.teamMemberCount, Math.ceil(allTeamMembers.length / allTeamNames.size));
      const adoptionRate = Math.min(100, (team.teamMemberCount / totalTeamSize) * 100);
      
      return {
        team: team.team,
        teamMemberCount: team.teamMemberCount,
        totalTeamSize,
        adoptionRate,
        totalHoursSaved: team.totalHoursSaved
      };
    }).sort((a, b) => b.adoptionRate - a.adoptionRate);
    
    // Prepare AI tool usage data for visualization
    const aiToolUsageByRole = {};
    const aiToolUsageByTeam = {};
    
    // Transform role tool usage data for visualization
    Object.entries(roleToolUsage).forEach(([role, tools]) => {
      aiToolUsageByRole[role] = Object.entries(tools).map(([tool, stats]) => ({
        tool,
        hoursSaved: stats.hoursSaved,
        usageCount: stats.usageCount
      })).sort((a, b) => b.hoursSaved - a.hoursSaved);
    });
    
    // Transform team tool usage data for visualization
    Object.entries(teamToolUsage).forEach(([team, tools]) => {
      aiToolUsageByTeam[team] = Object.entries(tools).map(([tool, stats]) => ({
        tool,
        hoursSaved: stats.hoursSaved,
        usageCount: stats.usageCount
      })).sort((a, b) => b.hoursSaved - a.hoursSaved);
    });
    
    // Update state with processed data
    setAnalysisData({
      roleAnalysis,
      teamMemberAnalysis,
      teamAnalysis,
      adoptionRates: {
        byRole: adoptionRatesByRole,
        byTeam: adoptionRatesByTeam
      },
      aiToolUsage: {
        byRole: aiToolUsageByRole,
        byTeam: aiToolUsageByTeam
      }
    });
  }, [filteredReports, allTeamMembers, allTeamNames]);

  return (
    <RoleTeamAnalysisPresentation 
      analysisData={analysisData}
      filters={filters}
    />
  );
};

export default RoleTeamAnalysisContainer;