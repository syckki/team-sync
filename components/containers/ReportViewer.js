import React from "react";
import styled from "styled-components";
import ResponsiveTable from "../presentational/ResponsiveTable";

// Styled components
const ViewerContainer = styled.div`
  margin-top: 2rem;
`;

const ReportList = styled.div`
  margin-top: 2rem;
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

const EmptyMessage = styled.div`
  padding: 1.5rem;
  text-align: center;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #e2e8f0;
  color: #6b7280;
`;

/**
 * Helper function to format dates
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Component for viewing submitted reports
 * 
 * @param {Object} props
 * @param {string} props.threadTitle - The title of the thread
 * @param {Array} props.reports - Array of report objects
 */
const ReportViewer = ({ threadTitle, reports = [] }) => {
  // Configure columns for the responsive table
  const columns = [
    { id: "sdlcStep", label: "SDLC Step", hideOnMobile: false },
    { id: "sdlcTask", label: "SDLC Task", hideOnMobile: false },
    { id: "hours", label: "Hours", align: "right", fixedWidth: "80px" },
    { id: "taskDetails", label: "Task Details" },
    { id: "aiTool", label: "AI Tool", hideOnMobile: true },
    { id: "aiProductivity", label: "AI Productivity", hideOnMobile: true },
    { id: "hoursSaved", label: "Saved", align: "right", fixedWidth: "80px" }
  ];

  return (
    <ViewerContainer>
      <h3>Team Reports for: {threadTitle}</h3>

      {reports.length === 0 ? (
        <EmptyMessage>
          <p>No productivity reports have been submitted yet.</p>
        </EmptyMessage>
      ) : (
        <ReportList>
          {reports.map((report, index) => {
            // Transform entries for responsive table
            const tableData = report.entries.map(entry => ({
              sdlcStep: entry.sdlcStep,
              sdlcTask: entry.sdlcTask,
              hours: entry.hours,
              taskDetails: entry.taskDetails,
              aiTool: Array.isArray(entry.aiTool) 
                ? entry.aiTool.join(", ")
                : entry.aiTool,
              aiProductivity: entry.aiProductivity || entry.qualityImpact,
              hoursSaved: entry.hoursSaved,
            }));

            // Calculate totals
            const totalHours = report.entries
              .reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0)
              .toFixed(1);
              
            const totalSaved = report.entries
              .reduce((sum, entry) => sum + (parseFloat(entry.hoursSaved) || 0), 0)
              .toFixed(1);

            // Create a summary row for the table
            const summaryRow = {
              sdlcStep: 'Total',
              sdlcTask: '',
              hours: totalHours,
              taskDetails: '',
              aiTool: '',
              aiProductivity: '',
              hoursSaved: totalSaved,
            };

            // Add summary row to the data
            const dataWithSummary = [...tableData, summaryRow];

            // Status function for highlighting the summary row
            const getRowStatus = (row) => {
              return row.sdlcStep === 'Total' ? 'summary' : null;
            };

            return (
              <ReportCard key={index}>
                <ReportHeader>
                  <ReportTitle>
                    Report from {report.teamMember} ({report.teamRole})
                  </ReportTitle>
                  <ReportDate>{formatDate(report.timestamp)}</ReportDate>
                </ReportHeader>

                <ReportContent>
                  <ResponsiveTable 
                    columns={columns}
                    data={dataWithSummary}
                    readonly={true}
                    getRowStatus={getRowStatus}
                    emptyState={{
                      title: "No tasks reported",
                      message: "This report doesn't contain any task entries.",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )
                    }}
                  />
                </ReportContent>
              </ReportCard>
            );
          })}
        </ReportList>
      )}
    </ViewerContainer>
  );
};

export default ReportViewer;