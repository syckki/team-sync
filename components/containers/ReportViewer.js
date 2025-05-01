import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import Link from "next/link";

// Import styled components from report.js that we'll need
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

const BackLinkText = styled.span`
  display: inline-block;
  margin-top: 1rem;
  color: #4e7fff;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

// Table components for report details
const ResponsiveTable = styled.div`
  width: 100%;
  margin-bottom: 1rem;
  border-radius: calc(0.5rem - 2px);
  position: relative;
  border: 1px solid rgb(229 231 235);
`;

const TableDesktop = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background-color: rgb(249 250 251);
  }

  tbody td:not(:first-of-type):not(:last-of-type) {
    padding: 0.75rem 0.75rem 0.75rem 0;
  }

  th,
  td {
    border: 0px;
    padding: 0.75rem;
    text-align: left;
  }

  th {
    font-weight: 500;
    font-size: 0.75rem;
    line-height: 1rem;
    text-transform: uppercase;
    color: rgb(107 114 128);
    letter-spacing: 0.05em;
    padding: 0.75rem;
  }

  td {
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding-top: 0.5rem 0.75rem;
  }

  tr:nth-child(even) {
    background-color: #f8f9fa;
  }

  /* We're only making the arrow clickable for expansion */

  tr.expanded {
    background-color: rgba(78, 127, 255, 0.08);
  }

  tr.detail-row {
    background-color: #f8fafc;
    border-top: 1px dashed #e2e8f0;
    border-bottom: 1px dashed #e2e8f0;
  }

  tr.detail-row td {
    padding: 0;
  }

  .expand-icon {
    color: #4e7fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    transition: transform 0.2s ease;
  }

  .expanded .expand-icon {
    transform: rotate(90deg);
  }

  @media (max-width: 992px) {
    display: none;
  }
`;

const TableMobile = styled.div`
  display: none;

  @media (max-width: 992px) {
    display: block;
  }
`;

const MobileCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: #fff;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const MobileCardHeader = styled.div`
  background-color: #f8fafc;
  padding: 0.75rem;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e2e8f0;
`;

const MobileCardBody = styled.div`
  padding: 0;
`;

const MobileCardField = styled.div`
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }

  &:nth-child(even) {
    background-color: #f8f9fa;
  }
`;

const MobileFieldLabel = styled.span`
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #444;
  font-size: 0.85rem;
`;

const MobileFieldValue = styled.span`
  color: #333;
`;

const MobileActions = styled.div`
  padding: 0.75rem;
  border-top: 1px solid #e2e8f0;
  background-color: #f8f9fa;
  display: flex;
  justify-content: flex-end;
`;

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper function to round to 2 decimal places
const roundToTwoDecimals = (number) => {
  return Math.round(number * 100) / 100;
};

// Helper function to sum up time saved
const calculateTotalTimeSaved = (reportRows) => {
  if (!reportRows || reportRows.length === 0) return 0;
  
  let total = 0;
  reportRows.forEach(row => {
    if (row.timeSaved) {
      const saved = parseFloat(row.timeSaved);
      if (!isNaN(saved)) {
        total += saved;
      }
    }
  });
  
  return roundToTwoDecimals(total);
};

const ReportViewer = ({ reports, threadTitle }) => {
  const router = useRouter();
  const [expandedRows, setExpandedRows] = React.useState({});
  
  const toggleRowExpansion = (reportIndex, rowIndex) => {
    const key = `${reportIndex}-${rowIndex}`;
    setExpandedRows(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  if (reports.length === 0) {
    return <p>No productivity reports have been submitted yet.</p>;
  }
  
  return (
    <>
      <h3>Team Reports for: {threadTitle}</h3>
      
      <ReportList>
        {reports.map((report, reportIndex) => (
          <ReportCard key={reportIndex}>
            <ReportHeader>
              <ReportTitle>
                Report from {report.teamMember} ({report.teamRole})
              </ReportTitle>
              <ReportDate>{formatDate(report.timestamp)}</ReportDate>
            </ReportHeader>
            
            <ReportContent>
              <p>
                <strong>Team:</strong> {report.teamName}
              </p>
              
              <ResponsiveTable>
                <TableDesktop>
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}></th>
                      <th>Platform</th>
                      <th>Project/Initiative</th>
                      <th>SDLC Phase</th>
                      <th style={{ width: "80px" }}>Est (h)</th>
                      <th style={{ width: "80px" }}>Act (h)</th>
                      <th style={{ width: "80px" }}>Saved (h)</th>
                      <th>AI Tools</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map((row, rowIndex) => (
                      <React.Fragment key={rowIndex}>
                        <tr
                          className={
                            expandedRows[`${reportIndex}-${rowIndex}`]
                              ? "expanded"
                              : ""
                          }
                        >
                          <td>
                            <div
                              className="expand-icon"
                              onClick={() =>
                                toggleRowExpansion(reportIndex, rowIndex)
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                width="20"
                                height="20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </td>
                          <td>{row.platform}</td>
                          <td>{row.projectInitiative}</td>
                          <td>{row.sdlcStep}</td>
                          <td>{row.estimatedTimeWithoutAI}</td>
                          <td>{row.actualTimeWithAI}</td>
                          <td>{row.timeSaved}</td>
                          <td>
                            {Array.isArray(row.aiToolUsed)
                              ? row.aiToolUsed.join(", ")
                              : row.aiToolUsed}
                          </td>
                        </tr>
                        {expandedRows[`${reportIndex}-${rowIndex}`] && (
                          <tr className="detail-row">
                            <td colSpan="8">
                              <div
                                style={{
                                  padding: "1rem",
                                  display: "grid",
                                  gap: "1rem",
                                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                                }}
                              >
                                <div>
                                  <strong>Task Category:</strong>{" "}
                                  {row.taskCategory}
                                </div>
                                <div>
                                  <strong>SDLC Task:</strong> {row.sdlcTask}
                                </div>
                                <div>
                                  <strong>Complexity:</strong>{" "}
                                  {row.complexity}
                                </div>
                                <div>
                                  <strong>Quality Impact:</strong>{" "}
                                  {row.qualityImpact}
                                </div>
                                <div style={{ gridColumn: "1 / -1" }}>
                                  <strong>Task Details:</strong>{" "}
                                  {row.taskDetails}
                                </div>
                                <div style={{ gridColumn: "1 / -1" }}>
                                  <strong>How AI Helped:</strong>{" "}
                                  {row.notesHowAIHelped}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    <tr style={{ fontWeight: "bold", backgroundColor: "#f0f9ff" }}>
                      <td colSpan="5" style={{ textAlign: "right" }}>
                        Total Time Saved:
                      </td>
                      <td colSpan="3">
                        {calculateTotalTimeSaved(report.rows)} hours
                      </td>
                    </tr>
                  </tbody>
                </TableDesktop>
                
                <TableMobile>
                  {report.rows.map((row, rowIndex) => (
                    <MobileCard key={rowIndex}>
                      <MobileCardHeader>
                        {row.projectInitiative || "Task " + (rowIndex + 1)}
                      </MobileCardHeader>
                      <MobileCardBody>
                        <MobileCardField>
                          <MobileFieldLabel>Platform</MobileFieldLabel>
                          <MobileFieldValue>{row.platform}</MobileFieldValue>
                        </MobileCardField>
                        <MobileCardField>
                          <MobileFieldLabel>SDLC Phase</MobileFieldLabel>
                          <MobileFieldValue>{row.sdlcStep}</MobileFieldValue>
                        </MobileCardField>
                        <MobileCardField>
                          <MobileFieldLabel>SDLC Task</MobileFieldLabel>
                          <MobileFieldValue>{row.sdlcTask}</MobileFieldValue>
                        </MobileCardField>
                        <MobileCardField>
                          <MobileFieldLabel>Est. Time (h)</MobileFieldLabel>
                          <MobileFieldValue>
                            {row.estimatedTimeWithoutAI}
                          </MobileFieldValue>
                        </MobileCardField>
                        <MobileCardField>
                          <MobileFieldLabel>Actual Time (h)</MobileFieldLabel>
                          <MobileFieldValue>{row.actualTimeWithAI}</MobileFieldValue>
                        </MobileCardField>
                        <MobileCardField>
                          <MobileFieldLabel>Time Saved (h)</MobileFieldLabel>
                          <MobileFieldValue>{row.timeSaved}</MobileFieldValue>
                        </MobileCardField>
                        <MobileCardField>
                          <MobileFieldLabel>Task Details</MobileFieldLabel>
                          <MobileFieldValue>{row.taskDetails}</MobileFieldValue>
                        </MobileCardField>
                        <MobileCardField>
                          <MobileFieldLabel>AI Tools Used</MobileFieldLabel>
                          <MobileFieldValue>
                            {Array.isArray(row.aiToolUsed)
                              ? row.aiToolUsed.join(", ")
                              : row.aiToolUsed}
                          </MobileFieldValue>
                        </MobileCardField>
                        <MobileCardField>
                          <MobileFieldLabel>How AI Helped</MobileFieldLabel>
                          <MobileFieldValue>{row.notesHowAIHelped}</MobileFieldValue>
                        </MobileCardField>
                      </MobileCardBody>
                    </MobileCard>
                  ))}
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#f0f9ff",
                      fontWeight: "bold",
                      marginTop: "1rem",
                      borderRadius: "0.375rem",
                    }}
                  >
                    Total Time Saved: {calculateTotalTimeSaved(report.rows)} hours
                  </div>
                </TableMobile>
              </ResponsiveTable>
            </ReportContent>
          </ReportCard>
        ))}
      </ReportList>
      
      <Link href={`/view/${router.query.id}`} legacyBehavior={false}>
        <BackLinkText>← Back to Thread</BackLinkText>
      </Link>
    </>
  );
};

export default ReportViewer;