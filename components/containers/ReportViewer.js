import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { importKeyFromBase64, decryptData } from "../../lib/cryptoUtils";
import ResponsiveTable from "../presentational/ResponsiveTable";
import CustomSelect from "../presentational/CustomSelect";

// Styled components
const Container = styled.div`
  width: 100%;
  margin-bottom: 2rem;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  padding: 0.75rem;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
  max-width: 250px;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4b5563;
  font-size: 0.875rem;
`;

const WeekSelector = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
`;

const WeekButton = styled.button`
  background-color: ${props => props.$active ? '#4e7fff' : '#e5e7eb'};
  color: ${props => props.$active ? 'white' : '#4b5563'};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$active ? '#4e7fff' : '#d1d5db'};
  }
`;

const SummaryCard = styled.div`
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const SummaryItem = styled.div`
  flex: 1;
  min-width: 150px;
`;

const SummaryLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const SummaryValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e3a8a;
`;

const ReportDetailsCard = styled.div`
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ReportHeader = styled.div`
  background-color: #f9fafb;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const ReportTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: #374151;
`;

const ReportMeta = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

// Platform options from the form
const platformOptions = [
  "Unete",
  "Revamp Somos Belcorp",
  "Digital Catalog",
  "Ecommerce Platform",
  "Foundation Tool",
  "Powder Tool",
  "Skin Advisor",
  "Newapp Somos Belcorp",
  "FFVV",
];

// SDLC Step options from the form
const sdlcSteps = [
  "Requirements",
  "Design",
  "Implementation",
  "Testing",
  "Deployment",
  "Maintenance",
];

// SDLC Task map from the form
const sdlcTasksMap = {
  Requirements: [
    "Requirement Gathering",
    "User Story Creation",
    "Feasibility Analysis",
    "Requirement Documentation",
    "Stakeholder Interviews",
  ],
  Design: [
    "Architecture Design",
    "Database Design",
    "UI/UX Design",
    "API Design",
    "System Modeling",
  ],
  Implementation: [
    "Frontend Development",
    "Backend Development",
    "Database Implementation",
    "API Development",
    "Integration",
  ],
  Testing: [
    "Unit Testing",
    "Integration Testing",
    "System Testing",
    "Performance Testing",
    "User Acceptance Testing",
  ],
  Deployment: [
    "Deployment Planning",
    "Environment Setup",
    "Data Migration",
    "Release Management",
    "Deployment Execution",
  ],
  Maintenance: [
    "Bug Fixing",
    "Feature Enhancement",
    "Performance Optimization",
    "Security Updates",
    "Documentation Updates",
  ],
};

// Complexity options
const complexityOptions = ["Low", "Medium", "High"];

// Report column definitions for ResponsiveTable
const reportColumns = [
  { 
    id: "platform", 
    label: "Platform",
    align: "left" 
  },
  { 
    id: "sdlcStep", 
    label: "SDLC Step",
    align: "left" 
  },
  { 
    id: "sdlcTask", 
    label: "SDLC Task",
    align: "left" 
  },
  { 
    id: "complexity", 
    label: "Complexity",
    align: "center" 
  },
  { 
    id: "estimatedHours", 
    label: "Est (h)",
    align: "right",
    fixedWidth: "100px",
    renderer: (value) => parseFloat(value).toFixed(1)
  },
  { 
    id: "actualHours", 
    label: "Act (h)",
    align: "right",
    fixedWidth: "100px",
    renderer: (value) => parseFloat(value).toFixed(1)
  },
  { 
    id: "hoursSaved", 
    label: "Saved (h)",
    align: "right",
    fixedWidth: "100px",
    renderer: (value, row) => (
      <span style={{ 
        color: parseFloat(value) > 0 ? '#16a34a' : 
               parseFloat(value) < 0 ? '#dc2626' : 'inherit',
        fontWeight: '500'
      }}>
        {parseFloat(value).toFixed(1)}
      </span>
    )
  },
];

// Helper function to group dates by week
const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

// Helper function to format date range for display
const formatWeekRange = (date) => {
  const d = new Date(date);
  const day = d.getDay() || 7; // If Sunday (0), change to 7
  
  // Get the start of the week (Monday)
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - day + 1);
  
  // Get the end of the week (Sunday)
  const weekEnd = new Date(d);
  weekEnd.setDate(d.getDate() + (7 - day));
  
  // Format the dates
  const options = { month: 'short', day: 'numeric' };
  return `${weekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}`;
};

const ReportViewer = ({ keyFragment, threadTitle }) => {
  const router = useRouter();
  const { id } = router.query;

  // State for raw reports data
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterSdlcStep, setFilterSdlcStep] = useState("");
  const [filterSdlcTask, setFilterSdlcTask] = useState("");
  const [filterComplexity, setFilterComplexity] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("all");

  // Derived state
  const availableSdlcTasks = filterSdlcStep 
    ? sdlcTasksMap[filterSdlcStep] || []
    : [];

  // Extract all entries from reports for analysis
  const allEntries = useMemo(() => {
    const entries = [];
    reports.forEach(report => {
      report.entries.forEach(entry => {
        entries.push({
          ...entry,
          reportId: report.id,
          timestamp: report.timestamp,
          teamMember: report.teamMember,
          teamRole: report.teamRole,
          estimatedHours: entry.estimatedTimeWithoutAI,
          actualHours: entry.actualTimeWithAI,
          hoursSaved: entry.timeSaved || (parseFloat(entry.estimatedTimeWithoutAI) - parseFloat(entry.actualTimeWithAI)).toFixed(1),
          weekNumber: getWeekNumber(report.timestamp),
          weekDisplay: formatWeekRange(report.timestamp)
        });
      });
    });
    return entries;
  }, [reports]);

  // Get unique weeks for filtering
  const availableWeeks = useMemo(() => {
    const weeks = {};
    allEntries.forEach(entry => {
      if (!weeks[entry.weekNumber]) {
        weeks[entry.weekNumber] = {
          weekNumber: entry.weekNumber,
          weekDisplay: entry.weekDisplay,
          timestamp: entry.timestamp
        };
      }
    });
    return Object.values(weeks).sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp));
  }, [allEntries]);

  // Apply filters to entries
  const filteredEntries = useMemo(() => {
    return allEntries.filter(entry => {
      // Apply platform filter
      if (filterPlatform && entry.platform !== filterPlatform) {
        return false;
      }
      
      // Apply SDLC Step filter
      if (filterSdlcStep && entry.sdlcStep !== filterSdlcStep) {
        return false;
      }
      
      // Apply SDLC Task filter
      if (filterSdlcTask && entry.sdlcTask !== filterSdlcTask) {
        return false;
      }
      
      // Apply complexity filter
      if (filterComplexity && entry.complexity !== filterComplexity) {
        return false;
      }
      
      // Apply week filter
      if (selectedWeek !== "all" && entry.weekNumber !== parseInt(selectedWeek)) {
        return false;
      }
      
      return true;
    });
  }, [
    allEntries, 
    filterPlatform, 
    filterSdlcStep, 
    filterSdlcTask, 
    filterComplexity,
    selectedWeek
  ]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalEstimatedHours = filteredEntries.reduce(
      (sum, entry) => sum + parseFloat(entry.estimatedHours || 0), 0
    );
    
    const totalActualHours = filteredEntries.reduce(
      (sum, entry) => sum + parseFloat(entry.actualHours || 0), 0
    );
    
    const totalHoursSaved = filteredEntries.reduce(
      (sum, entry) => sum + parseFloat(entry.hoursSaved || 0), 0
    );
    
    const productivityGain = totalEstimatedHours > 0 
      ? (totalHoursSaved / totalEstimatedHours * 100).toFixed(1)
      : 0;
    
    return {
      totalEntries: filteredEntries.length,
      totalEstimatedHours,
      totalActualHours,
      totalHoursSaved,
      productivityGain
    };
  }, [filteredEntries]);

  // Reset SDLC Task when SDLC Step changes
  useEffect(() => {
    setFilterSdlcTask("");
  }, [filterSdlcStep]);

  // Fetch reports data
  useEffect(() => {
    if (keyFragment && id) {
      fetchReports();
    }
  }, [keyFragment, id]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);

      // Get author ID from localStorage
      const authorId = localStorage.getItem("encrypted-app-author-id");
      if (!authorId) {
        throw new Error(
          "Author ID not found. Please go back to the thread view."
        );
      }

      // Fetch all messages from the thread
      const response = await fetch(
        `/api/download?threadId=${id}&authorId=${authorId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch thread data");
      }

      const threadData = await response.json();

      // Import the key from fragment
      const cryptoKey = await importKeyFromBase64(keyFragment);

      // Filter and decrypt reports
      const decryptedReports = [];

      for (const message of threadData.messages) {
        // Check if this message is marked as a report in metadata
        if (message.metadata && message.metadata.isReport) {
          try {
            // Convert base64 data back to ArrayBuffer
            const encryptedBytes = Uint8Array.from(atob(message.data), (c) =>
              c.charCodeAt(0)
            );

            // Extract IV and ciphertext
            const iv = encryptedBytes.slice(0, 12);
            const ciphertext = encryptedBytes.slice(12);

            // Decrypt the data
            const decrypted = await decryptData(ciphertext, cryptoKey, iv);

            // Parse the decrypted JSON
            const content = JSON.parse(new TextDecoder().decode(decrypted));

            decryptedReports.push({
              id: message.index,
              timestamp: message.metadata.timestamp || new Date().toISOString(),
              authorId: message.metadata.authorId,
              isCurrentUser: message.metadata.authorId === authorId,
              ...content,
            });
          } catch (err) {
            console.error("Error decrypting report:", err);
          }
        }
      }

      // Sort reports by timestamp, newest first
      decryptedReports.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setReports(decryptedReports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(`Failed to load reports: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterPlatform("");
    setFilterSdlcStep("");
    setFilterSdlcTask("");
    setFilterComplexity("");
    setSelectedWeek("all");
  };

  if (isLoading) {
    return (
      <Container>
        <p>Loading reports...</p>
      </Container>
    );
  }

  return (
    <Container>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <h2>AI Productivity Reports for: {threadTitle}</h2>

      {reports.length === 0 ? (
        <p>No productivity reports have been submitted yet.</p>
      ) : (
        <>
          <FilterSection>
            <FilterGroup>
              <FilterLabel>Platform</FilterLabel>
              <CustomSelect
                value={filterPlatform}
                onChange={setFilterPlatform}
                options={["", ...platformOptions]}
                placeholder="All Platforms"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>SDLC Step</FilterLabel>
              <CustomSelect
                value={filterSdlcStep}
                onChange={setFilterSdlcStep}
                options={["", ...sdlcSteps]}
                placeholder="All Steps"
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>SDLC Task</FilterLabel>
              <CustomSelect
                value={filterSdlcTask}
                onChange={setFilterSdlcTask}
                options={["", ...availableSdlcTasks]}
                placeholder="All Tasks"
                disabled={!filterSdlcStep}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Complexity</FilterLabel>
              <CustomSelect
                value={filterComplexity}
                onChange={setFilterComplexity}
                options={["", ...complexityOptions]}
                placeholder="All Levels"
              />
            </FilterGroup>
          </FilterSection>
          
          <WeekSelector>
            <WeekButton
              $active={selectedWeek === "all"}
              onClick={() => setSelectedWeek("all")}
            >
              All Time
            </WeekButton>
            
            {availableWeeks.map((week) => (
              <WeekButton
                key={week.weekNumber}
                $active={selectedWeek === week.weekNumber.toString()}
                onClick={() => setSelectedWeek(week.weekNumber.toString())}
              >
                {week.weekDisplay}
              </WeekButton>
            ))}
            
            <WeekButton
              onClick={resetFilters}
              style={{ marginLeft: 'auto', backgroundColor: '#f3f4f6', color: '#4b5563' }}
            >
              Reset Filters
            </WeekButton>
          </WeekSelector>

          <SummaryCard>
            <SummaryItem>
              <SummaryLabel>Entries</SummaryLabel>
              <SummaryValue>{summaryStats.totalEntries}</SummaryValue>
            </SummaryItem>
            
            <SummaryItem>
              <SummaryLabel>Est. Hours</SummaryLabel>
              <SummaryValue>{summaryStats.totalEstimatedHours.toFixed(1)}</SummaryValue>
            </SummaryItem>
            
            <SummaryItem>
              <SummaryLabel>Act. Hours</SummaryLabel>
              <SummaryValue>{summaryStats.totalActualHours.toFixed(1)}</SummaryValue>
            </SummaryItem>
            
            <SummaryItem>
              <SummaryLabel>Hours Saved</SummaryLabel>
              <SummaryValue style={{ 
                color: summaryStats.totalHoursSaved > 0 ? '#16a34a' : 
                      summaryStats.totalHoursSaved < 0 ? '#dc2626' : '#1e3a8a' 
              }}>
                {summaryStats.totalHoursSaved.toFixed(1)}
              </SummaryValue>
            </SummaryItem>
            
            <SummaryItem>
              <SummaryLabel>Productivity Gain</SummaryLabel>
              <SummaryValue style={{ color: '#16a34a' }}>
                {summaryStats.productivityGain}%
              </SummaryValue>
            </SummaryItem>
          </SummaryCard>

          <ResponsiveTable
            columns={reportColumns}
            data={filteredEntries}
            readonly={true}
            emptyState={{
              title: "No matching entries",
              message: "Try adjusting your filters to see more results.",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              )
            }}
          />
        </>
      )}
    </Container>
  );
};

export default ReportViewer;