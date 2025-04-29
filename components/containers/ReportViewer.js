import React, { useState, useMemo } from "react";
import styled from "styled-components";
import ResponsiveTable from "../presentational/ResponsiveTable";
import CustomSelect from "../presentational/CustomSelect";
import CreatableComboBox from "../presentational/CreatableComboBox";

// Styled components
const ViewerContainer = styled.div`
  margin-bottom: 2rem;
`;

const ReportCard = styled.div`
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const ReportTitle = styled.h3`
  margin: 0;
  color: #4e7fff;
  font-size: 1.2rem;
`;

const ReportDate = styled.span`
  color: #718096;
  font-size: 0.9rem;
`;

const ReportContent = styled.div`
  margin-top: 1rem;
  line-height: 1.5;
`;

const FiltersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const FilterGroup = styled.div`
  margin-bottom: 1rem;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4b5563;
  font-size: 0.875rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  padding: 1rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #4e7fff;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
`;

/**
 * ReportViewer Component - Displays reports with filtering and analysis
 *
 * @param {Object} props Component props
 * @param {Array} props.reports Array of report objects
 * @param {string} props.threadTitle Title of the thread
 * @param {boolean} props.isLoading Loading state
 */
const ReportViewer = ({ reports = [], threadTitle = "", isLoading = false }) => {
  // States for filters
  const [platformFilter, setPlatformFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [sdlcFilter, setSdlcFilter] = useState("");
  const [timeFrame, setTimeFrame] = useState("all");

  // Extract unique options for filters
  const platforms = useMemo(() => {
    const platformSet = new Set();
    reports.forEach((report) => {
      report.tasks.forEach((task) => {
        if (task.platform) platformSet.add(task.platform);
      });
    });
    return Array.from(platformSet);
  }, [reports]);

  const teamMembers = useMemo(() => {
    const memberSet = new Set();
    reports.forEach((report) => {
      if (report.teamMember) memberSet.add(report.teamMember);
    });
    return Array.from(memberSet);
  }, [reports]);

  const sdlcSteps = useMemo(() => {
    const sdlcSet = new Set();
    reports.forEach((report) => {
      report.tasks.forEach((task) => {
        if (task.sdlcStep) sdlcSet.add(task.sdlcStep);
      });
    });
    return Array.from(sdlcSet);
  }, [reports]);

  // Filter reports based on selected filters
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Time frame filter
      if (timeFrame !== "all") {
        const reportDate = new Date(report.timestamp);
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );

        if (timeFrame === "week" && reportDate < oneWeekAgo) return false;
        if (timeFrame === "month" && reportDate < oneMonthAgo) return false;
      }

      // Team member filter
      if (memberFilter && report.teamMember !== memberFilter) return false;

      // Task-based filters (platform and SDLC)
      if (platformFilter || sdlcFilter) {
        // Check if any task matches the filters
        const matchingTasks = report.tasks.filter((task) => {
          if (platformFilter && task.platform !== platformFilter) return false;
          if (sdlcFilter && task.sdlcStep !== sdlcFilter) return false;
          return true;
        });

        // Report matches if at least one task matches filters
        return matchingTasks.length > 0;
      }

      return true;
    });
  }, [reports, platformFilter, memberFilter, sdlcFilter, timeFrame]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredReports.length === 0) {
      return {
        totalTasks: 0,
        totalTimeSaved: 0,
        avgTimeSaved: 0,
        totalReports: 0,
      };
    }

    let totalTasks = 0;
    let totalTimeSaved = 0;

    filteredReports.forEach((report) => {
      const reportTasks = report.tasks || [];
      totalTasks += reportTasks.length;

      reportTasks.forEach((task) => {
        const timeSaved = parseFloat(task.timeSaved) || 0;
        totalTimeSaved += timeSaved;
      });
    });

    return {
      totalTasks,
      totalTimeSaved: totalTimeSaved.toFixed(2),
      avgTimeSaved: totalTasks > 0 ? (totalTimeSaved / totalTasks).toFixed(2) : 0,
      totalReports: filteredReports.length,
    };
  }, [filteredReports]);

  // Prepare data for the table
  const tableColumns = [
    { id: "member", label: "Team Member", fixedWidth: "150px" },
    { id: "date", label: "Date", fixedWidth: "120px" },
    { id: "platform", label: "Platform" },
    { id: "initiative", label: "Project/Initiative" },
    { id: "sdlc", label: "SDLC Phase" },
    { id: "task", label: "Task", hideOnMobile: true },
    { id: "est", label: "Est (h)", align: "right", fixedWidth: "80px" },
    { id: "act", label: "Act (h)", align: "right", fixedWidth: "80px" },
    { id: "saved", label: "Saved (h)", align: "right", fixedWidth: "80px" },
    { 
      id: "percentage", 
      label: "% Saved", 
      align: "right", 
      fixedWidth: "80px",
      renderer: (value) => `${value}%`
    },
  ];

  const tableData = useMemo(() => {
    const data = [];
    
    filteredReports.forEach((report) => {
      const { teamMember, timestamp, tasks } = report;
      const date = new Date(timestamp).toLocaleDateString();
      
      tasks.forEach((task) => {
        const estimated = parseFloat(task.estimatedTimeWithoutAI) || 0;
        const actual = parseFloat(task.actualTimeWithAI) || 0;
        const saved = parseFloat(task.timeSaved) || 0;
        const percentageSaved = estimated > 0 
          ? Math.round((saved / estimated) * 100) 
          : 0;
        
        data.push({
          member: teamMember,
          date,
          platform: task.platform,
          initiative: task.projectInitiative,
          sdlc: task.sdlcStep,
          task: task.taskDetails,
          est: task.estimatedTimeWithoutAI,
          act: task.actualTimeWithAI,
          saved: task.timeSaved,
          percentage: percentageSaved,
          // Include all original data for potential detailed view
          original: { ...task, teamMember, date, percentageSaved }
        });
      });
    });
    
    return data;
  }, [filteredReports]);

  if (isLoading) {
    return <div>Loading reports...</div>;
  }

  return (
    <ViewerContainer>
      <h3>Team Reports for: {threadTitle}</h3>

      {reports.length === 0 ? (
        <p>No productivity reports have been submitted yet.</p>
      ) : (
        <>
          <FiltersContainer>
            <FilterGroup>
              <FilterLabel>Time Frame</FilterLabel>
              <CustomSelect
                value={timeFrame}
                onChange={setTimeFrame}
                options={["all", "week", "month"]}
                placeholder="Select time frame"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Platform</FilterLabel>
              <CustomSelect
                value={platformFilter}
                onChange={setPlatformFilter}
                options={["", ...platforms]}
                placeholder="All Platforms"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Team Member</FilterLabel>
              <CustomSelect
                value={memberFilter}
                onChange={setMemberFilter}
                options={["", ...teamMembers]}
                placeholder="All Members"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>SDLC Phase</FilterLabel>
              <CustomSelect
                value={sdlcFilter}
                onChange={setSdlcFilter}
                options={["", ...sdlcSteps]}
                placeholder="All Phases"
              />
            </FilterGroup>
          </FiltersContainer>

          <StatsContainer>
            <StatCard>
              <StatValue>{stats.totalReports}</StatValue>
              <StatLabel>Reports</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.totalTasks}</StatValue>
              <StatLabel>Tasks</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.totalTimeSaved}h</StatValue>
              <StatLabel>Total Time Saved</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.avgTimeSaved}h</StatValue>
              <StatLabel>Avg. Time Saved/Task</StatLabel>
            </StatCard>
          </StatsContainer>

          <ResponsiveTable
            columns={tableColumns}
            data={tableData}
            readonly={true}
            emptyState={{
              title: "No matching reports",
              message: "Try adjusting your filters to see more results.",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              ),
            }}
          />
          
          {filteredReports.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <h3>Detailed Reports</h3>
              {filteredReports.map((report, index) => (
                <ReportCard key={index}>
                  <ReportHeader>
                    <ReportTitle>{report.teamMember}'s Report</ReportTitle>
                    <ReportDate>
                      {new Date(report.timestamp).toLocaleString()}
                    </ReportDate>
                  </ReportHeader>
                  
                  <div>
                    <strong>Team:</strong> {report.teamName}
                    <br />
                    <strong>Role:</strong> {report.teamRole}
                  </div>
                  
                  <ReportContent>
                    <h4>Tasks ({report.tasks.length})</h4>
                    
                    {report.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
                        <div>
                          <strong>Platform:</strong> {task.platform}
                          <br />
                          <strong>Project:</strong> {task.projectInitiative}
                          <br />
                          <strong>SDLC:</strong> {task.sdlcStep} - {task.sdlcTask}
                          <br />
                          <strong>Category:</strong> {task.taskCategory}
                        </div>
                        
                        <div style={{ margin: "0.75rem 0" }}>
                          <strong>Task Details:</strong>
                          <p style={{ margin: "0.5rem 0" }}>{task.taskDetails}</p>
                        </div>
                        
                        <div style={{ margin: "0.75rem 0", display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                          <div>
                            <strong>Est. Time w/o AI:</strong> {task.estimatedTimeWithoutAI}h
                          </div>
                          <div>
                            <strong>Actual Time w/ AI:</strong> {task.actualTimeWithAI}h
                          </div>
                          <div>
                            <strong>Time Saved:</strong> {task.timeSaved}h
                          </div>
                          <div>
                            <strong>Complexity:</strong> {task.complexity}
                          </div>
                          <div>
                            <strong>Quality Impact:</strong> {task.qualityImpact}
                          </div>
                        </div>
                        
                        <div>
                          <strong>AI Tools Used:</strong>{" "}
                          {task.aiToolUsed.join(", ")}
                        </div>
                        
                        <div style={{ margin: "0.75rem 0" }}>
                          <strong>How AI Helped:</strong>
                          <p style={{ margin: "0.5rem 0" }}>{task.notesHowAIHelped}</p>
                        </div>
                      </div>
                    ))}
                  </ReportContent>
                </ReportCard>
              ))}
            </div>
          )}
        </>
      )}
    </ViewerContainer>
  );
};

export default ReportViewer;