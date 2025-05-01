import React from "react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styled from "styled-components";

import { importKeyFromBase64, decryptData } from "../../lib/cryptoUtils";

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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

// Styled components for the responsive table
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

const ReportViewer = ({ keyFragment, threadTitle }) => {
  const router = useRouter();
  const { id } = router.query;

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  // Extract the key from URL fragment on mount
  useEffect(() => {
    console.log(keyFragment);
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);

      // Get author ID from localStorage
      const authorId = localStorage.getItem("encrypted-app-author-id");
      if (!authorId) {
        throw new Error(
          "Author ID not found. Please go back to the thread view.",
        );
      }

      // Fetch all messages from the thread
      const response = await fetch(
        `/api/download?threadId=${id}&authorId=${authorId}`,
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
              c.charCodeAt(0),
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
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
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

  if (isLoading) {
    return (
      <Container>
        <p>Loading...</p>
      </Container>
    );
  }

  return (
    <>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <>
        <h3>Team Reports for: {threadTitle}</h3>

        {reports.length === 0 ? (
          <p>No productivity reports have been submitted yet.</p>
        ) : (
          <ReportList>
            {reports.map((report, index) => (
              <ReportCard key={index}>
                <ReportHeader>
                  <ReportTitle>
                    Report from {report.teamMember} ({report.teamRole})
                  </ReportTitle>
                  <ReportDate>{formatDate(report.timestamp)}</ReportDate>
                </ReportHeader>

                <ReportContent>
                  <ResponsiveTable>
                    {/* Desktop Table View */}
                    <TableDesktop>
                      <thead>
                        <tr>
                          <th>SDLC Step</th>
                          <th>SDLC Task</th>
                          <th>Hours</th>
                          <th>Task Details</th>
                          <th>AI Tool</th>
                          <th>AI Productivity</th>
                          <th>Saved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.entries.map((entry, i) => (
                          <tr key={i}>
                            <td>{entry.sdlcStep}</td>
                            <td>{entry.sdlcTask}</td>
                            <td>{entry.hours}</td>
                            <td>{entry.taskDetails}</td>
                            <td>{entry.aiTool}</td>
                            <td>{entry.aiProductivity}</td>
                            <td>{entry.hoursSaved}</td>
                          </tr>
                        ))}
                        {/* Summary row */}
                        <tr
                          className="summary-row"
                          style={{
                            backgroundColor: "#f8fafc",
                            fontWeight: 600,
                            borderTop: "2px solid #e2e8f0",
                          }}
                        >
                          <td colSpan={2}>Total</td>
                          <td>
                            {report.entries
                              .reduce(
                                (sum, entry) =>
                                  sum + (parseFloat(entry.hours) || 0),
                                0,
                              )
                              .toFixed(1)}
                          </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>
                            {report.entries
                              .reduce(
                                (sum, entry) =>
                                  sum + (parseFloat(entry.hoursSaved) || 0),
                                0,
                              )
                              .toFixed(1)}
                          </td>
                        </tr>
                      </tbody>
                    </TableDesktop>

                    {/* Mobile Card View */}
                    <TableMobile>
                      {report.entries.map((entry, i) => (
                        <MobileCard key={i}>
                          <MobileCardHeader>Record #{i + 1}</MobileCardHeader>
                          <MobileCardBody>
                            <MobileCardField>
                              <MobileFieldLabel>SDLC Step</MobileFieldLabel>
                              <MobileFieldValue>
                                {entry.sdlcStep}
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>SDLC Task</MobileFieldLabel>
                              <MobileFieldValue>
                                {entry.sdlcTask}
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Hours</MobileFieldLabel>
                              <MobileFieldValue>{entry.hours}</MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Task Details</MobileFieldLabel>
                              <MobileFieldValue>
                                {entry.taskDetails}
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>AI Tool Used</MobileFieldLabel>
                              <MobileFieldValue>
                                {entry.aiTool}
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>
                                AI Productivity
                              </MobileFieldLabel>
                              <MobileFieldValue>
                                {entry.aiProductivity}
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Saved</MobileFieldLabel>
                              <MobileFieldValue>
                                {entry.hoursSaved}
                              </MobileFieldValue>
                            </MobileCardField>
                          </MobileCardBody>
                        </MobileCard>
                      ))}

                      {/* Summary Card for Mobile */}
                      <MobileCard
                        style={{
                          backgroundColor: "#f8fafc",
                          borderColor: "#4e7fff",
                          borderWidth: "2px",
                        }}
                      >
                        <MobileCardHeader
                          style={{
                            backgroundColor: "#4e7fff",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          Summary
                        </MobileCardHeader>
                        <MobileCardBody>
                          <MobileCardField>
                            <MobileFieldLabel>Total Hours</MobileFieldLabel>
                            <MobileFieldValue style={{ fontWeight: "bold" }}>
                              {report.entries
                                .reduce(
                                  (sum, entry) =>
                                    sum + (parseFloat(entry.hours) || 0),
                                  0,
                                )
                                .toFixed(1)}
                            </MobileFieldValue>
                          </MobileCardField>

                          <MobileCardField>
                            <MobileFieldLabel>Total Saved</MobileFieldLabel>
                            <MobileFieldValue style={{ fontWeight: "bold" }}>
                              {report.entries
                                .reduce(
                                  (sum, entry) =>
                                    sum + (parseFloat(entry.hoursSaved) || 0),
                                  0,
                                )
                                .toFixed(1)}
                            </MobileFieldValue>
                          </MobileCardField>
                        </MobileCardBody>
                      </MobileCard>
                    </TableMobile>
                  </ResponsiveTable>
                </ReportContent>
              </ReportCard>
            ))}
          </ReportList>
        )}
      </>
    </>
  );
};

export default ReportViewer;
