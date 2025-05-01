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

const KpiCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 640px) {
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

const BarContainer = styled.div`
  height: 1.5rem;
  background-color: #edf2f7;
  border-radius: 0.25rem;
  overflow: hidden;
  display: flex;
  margin-top: 0.25rem;
`;

const StackedBar = styled.div`
  height: 100%;
  background-color: ${props => props.$color || '#4e7fff'};
  width: ${props => `${props.$percentage}%`};
`;

const ProgressBar = styled.div`
  height: 0.5rem;
  background-color: #edf2f7;
  border-radius: 0.25rem;
  width: 100%;
  overflow: hidden;
  margin-top: 0.25rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #4e7fff;
  width: ${props => `${Math.min(props.$percentage, 100)}%`};
`;

const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
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

/**
 * Presentation component for the Productivity Analysis by Role and Team report
 */
const RoleTeamAnalysisPresentation = ({ analysisData, filters }) => {
  // State to track active tab
  const [activeTab, setActiveTab] = useState('roles');
  
  const { 
    roleAnalysis, 
    teamMemberAnalysis, 
    teamAnalysis,
    adoptionRates, 
    aiToolUsage 
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
  
  // Create table columns for role analysis
  const roleColumns = [
    { header: 'Role', field: 'role' },
    { header: 'Time Saved', field: 'totalHoursSaved', render: (value) => `${formatNumber(value)} hrs` },
    { header: 'Avg. Saved/Task', field: 'averageHoursSaved', render: (value) => `${formatNumber(value)} hrs` },
    { 
      header: 'Most Used Tools', 
      field: 'mostUsedTools',
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
    { header: 'Team Members', field: 'teamMemberCount' }
  ];
  
  // Create table columns for team member analysis
  const teamMemberColumns = [
    { header: 'Team Member', field: 'teamMember' },
    { header: 'Role', field: 'role' },
    { header: 'Time Saved', field: 'totalHoursSaved', render: (value) => `${formatNumber(value)} hrs` },
    { header: 'Avg. Saved/Task', field: 'averageHoursSaved', render: (value) => `${formatNumber(value)} hrs` },
    { 
      header: 'Most Used Tools', 
      field: 'mostUsedTools',
      render: (tools) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {tools.map((tool, i) => (
            <ToolChip key={i} style={{ backgroundColor: `${getToolColor(tool)}20`, color: getToolColor(tool) }}>
              {tool}
            </ToolChip>
          ))}
        </div>
      )
    }
  ];
  
  // Create table columns for team analysis
  const teamColumns = [
    { header: 'Team', field: 'team' },
    { header: 'Time Saved', field: 'totalHoursSaved', render: (value) => `${formatNumber(value)} hrs` },
    { header: 'Avg. Saved/Task', field: 'averageHoursSaved', render: (value) => `${formatNumber(value)} hrs` },
    { 
      header: 'Most Used Tools', 
      field: 'mostUsedTools',
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
    { header: 'Team Members', field: 'teamMemberCount' }
  ];
  
  // Generate stacked bar data for roles
  const generateRoleStackedBarData = () => {
    if (!aiToolUsage.byRole) return [];
    
    // Get top roles by total time saved
    const topRoles = roleAnalysis.slice(0, 5).map(role => role.role);
    
    return topRoles.map(roleName => {
      const roleTools = aiToolUsage.byRole[roleName] || [];
      const totalSaved = roleTools.reduce((sum, tool) => sum + tool.hoursSaved, 0);
      
      const bars = roleTools.map(tool => ({
        tool: tool.tool,
        value: tool.hoursSaved,
        percentage: totalSaved > 0 ? (tool.hoursSaved / totalSaved) * 100 : 0,
        color: getToolColor(tool.tool)
      }));
      
      return {
        name: roleName,
        totalValue: totalSaved,
        bars
      };
    });
  };
  
  // Generate stacked bar data for teams
  const generateTeamStackedBarData = () => {
    if (!aiToolUsage.byTeam) return [];
    
    // Get top teams by total time saved
    const topTeams = teamAnalysis.slice(0, 5).map(team => team.team);
    
    return topTeams.map(teamName => {
      const teamTools = aiToolUsage.byTeam[teamName] || [];
      const totalSaved = teamTools.reduce((sum, tool) => sum + tool.hoursSaved, 0);
      
      const bars = teamTools.map(tool => ({
        tool: tool.tool,
        value: tool.hoursSaved,
        percentage: totalSaved > 0 ? (tool.hoursSaved / totalSaved) * 100 : 0,
        color: getToolColor(tool.tool)
      }));
      
      return {
        name: teamName,
        totalValue: totalSaved,
        bars
      };
    });
  };
  
  // If no data is available
  if ((!roleAnalysis || roleAnalysis.length === 0) && 
      (!teamMemberAnalysis || teamMemberAnalysis.length === 0)) {
    return (
      <ReportContainer>
        <ReportTitle>Productivity Analysis by Role and Team</ReportTitle>
        <NoDataMessage>No productivity data available for the selected filters.</NoDataMessage>
      </ReportContainer>
    );
  }
  
  // Get stacked bar data based on active tab
  const stackedBarData = activeTab === 'roles' 
    ? generateRoleStackedBarData() 
    : generateTeamStackedBarData();
  
  // Extract all unique tools for legend
  const allTools = new Set();
  stackedBarData.forEach(item => {
    item.bars.forEach(bar => allTools.add(bar.tool));
  });
  const legendItems = Array.from(allTools).map(tool => ({
    name: tool,
    color: getToolColor(tool)
  }));

  return (
    <ReportContainer>
      <ReportTitle>Productivity Analysis by Role and Team</ReportTitle>
      
      {/* Tab Navigation */}
      <TabsContainer>
        <TabButton 
          $active={activeTab === 'roles'} 
          onClick={() => setActiveTab('roles')}
        >
          By Role
        </TabButton>
        <TabButton 
          $active={activeTab === 'members'} 
          onClick={() => setActiveTab('members')}
        >
          By Team Member
        </TabButton>
        <TabButton 
          $active={activeTab === 'teams'} 
          onClick={() => setActiveTab('teams')}
        >
          By Team
        </TabButton>
        <TabButton 
          $active={activeTab === 'adoption'} 
          onClick={() => setActiveTab('adoption')}
        >
          Adoption Rates
        </TabButton>
      </TabsContainer>
      
      {/* Roles Analysis Tab */}
      {activeTab === 'roles' && (
        <>
          <Section>
            <SectionTitle>Role Productivity Analysis</SectionTitle>
            {roleAnalysis.length > 0 ? (
              <ResponsiveTable 
                data={roleAnalysis}
                columns={roleColumns}
                keyField="role"
                emptyMessage="No role data available"
              />
            ) : (
              <NoDataMessage>No role productivity data available.</NoDataMessage>
            )}
          </Section>
          
          {/* Tools by Role Visualization */}
          {stackedBarData.length > 0 && (
            <Section>
              <SectionTitle>AI Tool Usage by Role</SectionTitle>
              
              <LegendContainer>
                {legendItems.map((item, index) => (
                  <LegendItem key={index}>
                    <LegendColor $color={item.color} />
                    {item.name}
                  </LegendItem>
                ))}
              </LegendContainer>
              
              <ChartContainer>
                {stackedBarData.map((roleData, index) => (
                  <ChartRow key={index}>
                    <ChartLabel>
                      {roleData.name}
                      <ChartValue>{formatNumber(roleData.totalValue)} hrs saved</ChartValue>
                    </ChartLabel>
                    <BarContainer>
                      {roleData.bars.map((bar, barIndex) => (
                        <StackedBar 
                          key={barIndex} 
                          $color={bar.color}
                          $percentage={bar.percentage}
                          title={`${bar.tool}: ${formatNumber(bar.value)} hrs (${formatPercent(bar.percentage)})`}
                        />
                      ))}
                    </BarContainer>
                  </ChartRow>
                ))}
              </ChartContainer>
            </Section>
          )}
        </>
      )}
      
      {/* Team Members Analysis Tab */}
      {activeTab === 'members' && (
        <Section>
          <SectionTitle>Team Member Productivity Analysis</SectionTitle>
          {teamMemberAnalysis.length > 0 ? (
            <ResponsiveTable 
              data={teamMemberAnalysis}
              columns={teamMemberColumns}
              keyField="teamMember"
              emptyMessage="No team member data available"
              headerTitle="Team Member"
            />
          ) : (
            <NoDataMessage>No team member productivity data available.</NoDataMessage>
          )}
        </Section>
      )}
      
      {/* Teams Analysis Tab */}
      {activeTab === 'teams' && (
        <>
          <Section>
            <SectionTitle>Team Productivity Analysis</SectionTitle>
            {teamAnalysis && teamAnalysis.length > 0 ? (
              <ResponsiveTable 
                data={teamAnalysis}
                columns={teamColumns}
                keyField="team"
                emptyMessage="No team data available"
                headerTitle="Team"
              />
            ) : (
              <NoDataMessage>No team productivity data available.</NoDataMessage>
            )}
          </Section>
          
          {/* Tools by Team Visualization */}
          {stackedBarData.length > 0 && (
            <Section>
              <SectionTitle>AI Tool Usage by Team</SectionTitle>
              
              <LegendContainer>
                {legendItems.map((item, index) => (
                  <LegendItem key={index}>
                    <LegendColor $color={item.color} />
                    {item.name}
                  </LegendItem>
                ))}
              </LegendContainer>
              
              <ChartContainer>
                {stackedBarData.map((teamData, index) => (
                  <ChartRow key={index}>
                    <ChartLabel>
                      {teamData.name}
                      <ChartValue>{formatNumber(teamData.totalValue)} hrs saved</ChartValue>
                    </ChartLabel>
                    <BarContainer>
                      {teamData.bars.map((bar, barIndex) => (
                        <StackedBar 
                          key={barIndex} 
                          $color={bar.color}
                          $percentage={bar.percentage}
                          title={`${bar.tool}: ${formatNumber(bar.value)} hrs (${formatPercent(bar.percentage)})`}
                        />
                      ))}
                    </BarContainer>
                  </ChartRow>
                ))}
              </ChartContainer>
            </Section>
          )}
        </>
      )}
      
      {/* Adoption Rates Tab */}
      {activeTab === 'adoption' && (
        <>
          {/* Adoption rates by role */}
          <Section>
            <SectionTitle>AI Adoption Rates by Role</SectionTitle>
            {adoptionRates.byRole && adoptionRates.byRole.length > 0 ? (
              <ChartContainer>
                {adoptionRates.byRole.map((role, index) => (
                  <ChartRow key={index}>
                    <ChartLabel>
                      {role.role}
                      <ChartValue>{formatPercent(role.adoptionRate)}</ChartValue>
                    </ChartLabel>
                    <ProgressBar>
                      <ProgressFill $percentage={role.adoptionRate} />
                    </ProgressBar>
                    <ChartValue style={{ marginTop: '0.25rem', fontSize: '0.7rem' }}>
                      {role.teamMemberCount} team member{role.teamMemberCount !== 1 ? 's' : ''}
                      {' • '}{formatNumber(role.totalHoursSaved)} hrs saved
                    </ChartValue>
                  </ChartRow>
                ))}
              </ChartContainer>
            ) : (
              <NoDataMessage>No adoption rate data available by role.</NoDataMessage>
            )}
          </Section>
          
          {/* Adoption rates by team */}
          <Section>
            <SectionTitle>AI Adoption Rates by Team</SectionTitle>
            {adoptionRates.byTeam && adoptionRates.byTeam.length > 0 ? (
              <ChartContainer>
                {adoptionRates.byTeam.map((team, index) => (
                  <ChartRow key={index}>
                    <ChartLabel>
                      {team.team}
                      <ChartValue>{formatPercent(team.adoptionRate)}</ChartValue>
                    </ChartLabel>
                    <ProgressBar>
                      <ProgressFill $percentage={team.adoptionRate} />
                    </ProgressBar>
                    <ChartValue style={{ marginTop: '0.25rem', fontSize: '0.7rem' }}>
                      {team.teamMemberCount} of {team.totalTeamSize} team members
                      {' • '}{formatNumber(team.totalHoursSaved)} hrs saved
                    </ChartValue>
                  </ChartRow>
                ))}
              </ChartContainer>
            ) : (
              <NoDataMessage>No adoption rate data available by team.</NoDataMessage>
            )}
          </Section>
        </>
      )}
    </ReportContainer>
  );
};

export default RoleTeamAnalysisPresentation;