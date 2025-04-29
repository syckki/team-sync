import React from "react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";
import styled from "styled-components";
import Link from "next/link";
import {
  importKeyFromBase64,
  encryptData,
  decryptData,
} from "../../../lib/cryptoUtils";
import CustomSelect from "../../../components/presentational/CustomSelect";
import CreatableComboBox from "../../../components/presentational/CreatableComboBox";
import CreatableMultiSelect from "../../../components/presentational/CreatableMultiSelect";
import AutoResizeTextArea from "../../../components/presentational/AutoResizeTextArea";
import ResponsiveTable from "../../../components/presentational/ResponsiveTable";

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

const HeaderBanner = styled.div`
  background-color: hsl(217 91% 60%);
  color: white;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  color: white;
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.5rem;
  letter-spacing: -0.025em;
  font-weight: 500;
  display: flex;
  align-items: center;
`;

const LockIcon = styled.div`
  width: 1.25rem;
  height: auto;
  margin-right: 0.5rem;
  display: inline-flex;
`;

const PageSubtitle = styled.p`
  margin: 0;
  margin-top: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgb(255 255 255 / 0.9);
`;

const ContentContainer = styled.div`
  padding: 0 2rem 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem 1.5rem;
  }
`;

const ReportForm = styled.form`
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const TeamFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (min-width: 992px) {
    flex-direction: row;

    & > div {
      flex: 1;
    }
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: hsl(20 14.3% 4.1%);
  font-size: 0.875rem;
  line-height: 1;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(20 5.9% 90%);
  border-radius: calc(0.5rem - 2px);
  font-size: 0.875rem;
  line-height: 1.25rem;
  background-color: #f8f9fa;

  &:focus {
    outline: none;
    border-color: #4e7fff;
    background-color: #fff;
  }

  &:read-only {
    background-color: rgb(243 244 246);
    cursor: not-allowed;
  }
`;

const InnerLabel = styled.div`
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1rem;
  text-transform: uppercase;
  color: rgb(107 114 128);
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
`;

const SubmitButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: hsl(217 91% 60%);
  color: hsl(217 100% 99%);
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  line-height: 1.25rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3d6bf3;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
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

const ErrorMessage = styled.div`
  color: #e53e3e;
  padding: 0.75rem;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  color: #38a169;
  padding: 0.75rem;
  background-color: #f0fff4;
  border: 1px solid #c6f6d5;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

// Styled components for the legacy responsive table (to be replaced)
const LegacyResponsiveTable = styled.div`
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

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: calc(0.5rem - 2px);
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  background-color: ${(props) =>
    props.primary ? "#4e7fff" : "hsl(60 4.8% 95.9%)"};
  color: hsl(24 9.8% 10%;);
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) =>
      props.primary ? "#3d6bf3" : "hsl(60 4.8% 95.9%)"};
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const AddIcon = styled.div`
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
`;

const DeleteButton = styled.button`
  background: none;
  color: rgb(239 68 68);
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  justify-self: center;

  &:hover {
    background-color: rgb(239 68 68 / 0.15);
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
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

const sdlcSteps = [
  "Requirements",
  "Design",
  "Implementation",
  "Testing",
  "Deployment",
  "Maintenance",
];

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

const ReportPage = () => {
  const router = useRouter();
  const { id, view } = router.query;
  const isViewMode = view === "true";

  const [key, setKey] = useState(null);
  const [threadTitle, setThreadTitle] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamMember, setTeamMember] = useState("");
  const [teamMemberOptions, setTeamMemberOptions] = useState([]);
  const [teamRole, setTeamRole] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [rows, setRows] = useState([
    {
      id: Date.now(),
      platform: "",
      projectInitiative: "",
      sdlcStep: "",
      sdlcTask: "",
      taskCategory: "",
      taskDetails: "",
      estimatedTimeWithoutAI: "",
      actualTimeWithAI: "",
      // timeSaved is calculated
      aiToolUsed: [],
      complexity: "",
      qualityImpact: "",
      notesHowAIHelped: "",
    },
  ]);

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Extract the key from URL fragment on mount
  useEffect(() => {
    if (!router.isReady) return;

    try {
      // Extract key from URL fragment (#)
      const fragment = window.location.hash.slice(1);

      if (!fragment) {
        setError(
          "No encryption key found. Please return to the thread and use the link provided there.",
        );
        return;
      }

      setKey(fragment);

      // Load team member options from localStorage if available
      try {
        const savedOptions = localStorage.getItem("teamMemberOptions");
        if (savedOptions) {
          setTeamMemberOptions(JSON.parse(savedOptions));
        }
      } catch (localStorageErr) {
        console.error("Error loading team member options:", localStorageErr);
        // Non-critical error, continue without saved options
      }

      // If in view mode, fetch the reports
      if (isViewMode) {
        fetchReports(fragment);
      }
    } catch (err) {
      console.error("Error parsing key:", err);
      setError("Could not retrieve encryption key from URL.");
    } finally {
      setIsLoading(false);
    }
  }, [router.isReady, isViewMode, id]);

  // Fetch thread title when key is available
  useEffect(() => {
    if (key && id) {
      const authorId = localStorage.getItem("encrypted-app-author-id");
      if (authorId) {
        fetch(`/api/download?threadId=${id}&authorId=${authorId}`)
          .then((response) => response.json())
          .then((data) => {
            setThreadTitle(data.threadTitle || id);
            setTeamName(data.threadTitle || id);
          })
          .catch((err) => {
            console.error("Error fetching thread data:", err);
          });
      }
    }
  }, [key, id]);

  const fetchReports = async (keyValue) => {
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
      const cryptoKey = await importKeyFromBase64(keyValue);

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

  const handleSDLCStepChange = (id, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id
          ? { ...row, sdlcStep: value, sdlcTask: "" } // Reset task when step changes
          : row,
      ),
    );
  };

  // Function to round time to the nearest quarter hour (0.00, 0.25, 0.50, 0.75)
  const roundToQuarterHour = (time) => {
    const value = parseFloat(time) || 0;
    return (Math.round(value * 4) / 4).toFixed(2);
  };

  const handleRowChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };

          // If changing time fields, apply quarter-hour rounding
          if (
            field === "estimatedTimeWithoutAI" ||
            field === "actualTimeWithAI"
          ) {
            // Round to nearest quarter hour
            if (field === "estimatedTimeWithoutAI") {
              updatedRow.estimatedTimeWithoutAI = roundToQuarterHour(value);
            }
            if (field === "actualTimeWithAI") {
              updatedRow.actualTimeWithAI = roundToQuarterHour(value);
            }
          }

          // Auto-calculate timeSaved if both time fields have values
          if (
            (field === "estimatedTimeWithoutAI" ||
              field === "actualTimeWithAI") &&
            updatedRow.estimatedTimeWithoutAI &&
            updatedRow.actualTimeWithAI
          ) {
            const estimatedTime =
              parseFloat(updatedRow.estimatedTimeWithoutAI) || 0;
            const actualTime = parseFloat(updatedRow.actualTimeWithAI) || 0;
            // We don't use Math.max here as we want to show negative savings too
            const timeSaved = (estimatedTime - actualTime).toFixed(2);
            updatedRow.timeSaved = timeSaved;
          }

          return updatedRow;
        }
        return row;
      }),
    );
  };

  const addRow = () => {
    setRows((prevRows) => [
      ...prevRows,
      {
        id: Date.now(),
        platform: "",
        projectInitiative: "",
        sdlcStep: "",
        sdlcTask: "",
        taskCategory: "",
        taskDetails: "",
        estimatedTimeWithoutAI: "",
        actualTimeWithAI: "",
        // timeSaved is calculated
        aiToolUsed: [],
        complexity: "",
        qualityImpact: "",
        notesHowAIHelped: "",
      },
    ]);
  };

  const removeRow = (id) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const toggleRowExpand = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!key) {
        throw new Error("Encryption key not found");
      }

      if (!teamName.trim() || !teamMember.trim() || !teamRole.trim()) {
        throw new Error("Please fill in all team information fields");
      }

      // Validate rows
      for (const row of rows) {
        if (
          !row.platform ||
          !row.projectInitiative ||
          !row.sdlcStep ||
          !row.sdlcTask ||
          !row.taskCategory ||
          !row.taskDetails ||
          !row.estimatedTimeWithoutAI ||
          !row.actualTimeWithAI ||
          !row.timeSaved ||
          !row.aiToolUsed ||
          row.aiToolUsed.length === 0 ||
          !row.complexity ||
          !row.qualityImpact ||
          !row.notesHowAIHelped
        ) {
          throw new Error(
            "Please fill in all fields for each productivity entry",
          );
        }
      }

      // Get author ID from localStorage
      const authorId =
        localStorage.getItem("encrypted-app-author-id") ||
        `author-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

      // Ensure author ID is saved
      localStorage.setItem("encrypted-app-author-id", authorId);

      // Create report data object
      const reportData = {
        type: "aiProductivityReport",
        teamName,
        teamMember,
        teamRole,
        entries: rows,
        timestamp: new Date().toISOString(),
      };

      // Convert to JSON
      const jsonData = JSON.stringify(reportData);

      // Import the key
      const cryptoKey = await importKeyFromBase64(key);

      // Encrypt the report data
      const { ciphertext, iv } = await encryptData(jsonData, cryptoKey);

      // Combine IV and ciphertext
      const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
      combinedData.set(iv, 0);
      combinedData.set(new Uint8Array(ciphertext), iv.length);

      // Submit the encrypted report
      const response = await fetch(`/api/reports?threadId=${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Author-ID": authorId,
        },
        body: combinedData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit AI productivity report");
      }

      setSuccess(true);

      // Reset form after successful submission
      setRows([
        {
          id: Date.now(),
          platform: "",
          projectInitiative: "",
          sdlcStep: "",
          sdlcTask: "",
          taskCategory: "",
          taskDetails: "",
          estimatedTimeWithoutAI: "",
          actualTimeWithAI: "",
          // timeSaved is calculated
          aiToolUsed: [],
          complexity: "",
          qualityImpact: "",
          notesHowAIHelped: "",
        },
      ]);
    } catch (err) {
      console.error("Error submitting report:", err);
      setError(`Failed to submit report: ${err.message}`);
    } finally {
      setIsSubmitting(false);
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
      <Head>
        <title>
          {isViewMode
            ? "View AI Productivity Reports"
            : "Submit AI Productivity Report"}
        </title>
        <meta
          name="description"
          content="AI Productivity Reporting for Secure Teams"
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Container>
        <HeaderBanner>
          <PageTitle>
            <LockIcon>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </LockIcon>
            AI Productivity Report
          </PageTitle>
          <PageSubtitle>
            Track and measure your productivity gains from using AI tools
          </PageSubtitle>
        </HeaderBanner>

        <ContentContainer>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && (
            <SuccessMessage>
              Your AI productivity report has been submitted successfully!
            </SuccessMessage>
          )}

          {isViewMode ? (
            // Reports viewing mode
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
                        {/* Define the report view columns */}
                        {(() => {
                          // Calculate totals for the report
                          const totalHours = report.entries
                            .reduce(
                              (sum, entry) => sum + (parseFloat(entry.hours) || 0),
                              0
                            )
                            .toFixed(1);
                          
                          const totalSaved = report.entries
                            .reduce(
                              (sum, entry) => sum + (parseFloat(entry.hoursSaved) || 0),
                              0
                            )
                            .toFixed(1);
                          
                          // Column definitions for the report view
                          const reportColumns = [
                            {
                              id: 'sdlcStep',
                              label: 'SDLC Step',
                              align: 'left'
                            },
                            {
                              id: 'sdlcTask',
                              label: 'SDLC Task',
                              align: 'left'
                            },
                            {
                              id: 'hours',
                              label: 'Hours',
                              fixedWidth: '100px',
                              align: 'right'
                            },
                            {
                              id: 'taskDetails',
                              label: 'Task Details',
                              align: 'left'
                            },
                            {
                              id: 'aiTool',
                              label: 'AI Tool',
                              align: 'left',
                              hideOnMobile: false
                            },
                            {
                              id: 'aiProductivity',
                              label: 'AI Productivity',
                              align: 'left'
                            },
                            {
                              id: 'hoursSaved',
                              label: 'Saved',
                              fixedWidth: '100px',
                              align: 'right',
                              cellStyle: `
                                color: #16a34a;
                                font-weight: 500;
                              `
                            }
                          ];
                          
                          // Create a special footer row for totals
                          const dataWithFooter = [
                            ...report.entries,
                            {
                              id: 'footer',
                              isFooter: true,
                              sdlcStep: 'Total',
                              sdlcTask: '',
                              hours: totalHours,
                              taskDetails: '',
                              aiTool: '',
                              aiProductivity: '',
                              hoursSaved: totalSaved
                            }
                          ];
                          
                          // Custom row status function for the summary row
                          const getRowStatus = (row) => {
                            if (row.isFooter) return 'summary';
                            return null;
                          };
                          
                          // Custom cell renderer to handle the footer row differently
                          const cellRenderer = (value, row, columnId) => {
                            if (row.isFooter) {
                              if (columnId === 'sdlcStep') {
                                return <strong>Total</strong>;
                              }
                              if (columnId === 'hours' || columnId === 'hoursSaved') {
                                return <strong>{value}</strong>;
                              }
                              return null;
                            }
                            return value;
                          };
                          
                          // Update column renderers
                          const columnsWithRenderers = reportColumns.map(col => ({
                            ...col,
                            renderer: (value, row) => cellRenderer(value, row, col.id)
                          }));
                          
                          // Return the ResponsiveTable component
                          return (
                            <ResponsiveTable
                              columns={columnsWithRenderers}
                              data={dataWithFooter}
                              getRowStatus={getRowStatus}
                              readonly={true}
                              emptyState={{
                                title: "No report entries",
                                message: "This report doesn't contain any entries yet.",
                                icon: (
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                )
                              }}
                            />
                          );
                        })()}
                        
                      </ReportContent>
                    </ReportCard>
                  ))}
                </ReportList>
              )}
            </>
          ) : (
            // Report submission form
            <>
              {!success && (
                <ReportForm onSubmit={handleSubmit}>
                  <TeamFormSection>
                    <FormGroup>
                      <Label htmlFor="teamName">Team Name</Label>
                      <Input
                        type="text"
                        id="teamName"
                        value={teamName}
                        readOnly
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="teamMember">Team Member Name</Label>
                      <CreatableComboBox
                        value={teamMember}
                        onChange={setTeamMember}
                        options={teamMemberOptions}
                        placeholder="Enter your name"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="teamRole">Role on the Team</Label>
                      <Input
                        type="text"
                        id="teamRole"
                        value={teamRole}
                        onChange={(e) => setTeamRole(e.target.value)}
                        required
                        placeholder="Your role (e.g., Developer, Designer, Project Manager)"
                      />
                    </FormGroup>
                  </TeamFormSection>

                  {/* Input Form Table using ResponsiveTable */}
                  {(() => {
                    // Array to track expanded rows
                    const rowsWithExpand = rows.map(row => ({
                      ...row,
                      isExpanded: expandedRows[row.id] || false
                    }));
                    
                    // Calculate time saved
                    const calculateTimeSaved = (row) => {
                      if (row.estimatedTimeWithoutAI && row.actualTimeWithAI) {
                        return (parseFloat(row.estimatedTimeWithoutAI) - parseFloat(row.actualTimeWithAI)).toFixed(1);
                      }
                      return "-";
                    };
                    
                    // Column definitions for the input form
                    const formColumns = [
                      {
                        id: 'expandControl',
                        label: '',
                        fixedWidth: '40px',
                        align: 'center',
                        renderer: (value, row) => (
                          <div 
                            className="expand-icon" 
                            style={{
                              cursor: 'pointer',
                              color: '#4e7fff',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '1.5rem',
                              height: '1.5rem',
                              transition: 'transform 0.2s ease',
                              transform: row.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpand(row.id);
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </div>
                        )
                      },
                      {
                        id: 'platform',
                        label: 'Platform',
                        align: 'left',
                        renderer: (value, row) => (
                          <CreatableComboBox
                            value={value}
                            onChange={(newValue) => handleRowChange(row.id, "platform", newValue)}
                            options={[
                              "Unete",
                              "Revamp Somos Belcorp",
                              "Digital Catalog",
                              "Ecommerce Platform",
                              "Foundation Tool",
                              "Powder Tool",
                              "Skin Advisor",
                              "Newapp Somos Belcorp",
                              "FFVV",
                            ]}
                            placeholder="Platform"
                            storageKey="platformOptions"
                          />
                        )
                      },
                      {
                        id: 'projectInitiative',
                        label: 'Initiative',
                        align: 'left',
                        renderer: (value, row) => (
                          <CreatableComboBox
                            value={value}
                            onChange={(newValue) => 
                              handleRowChange(row.id, "projectInitiative", newValue)
                            }
                            options={[]}
                            placeholder="Initiative"
                            storageKey="projectOptions"
                          />
                        )
                      },
                      {
                        id: 'sdlcStep',
                        label: 'SDLC Step',
                        align: 'left',
                        renderer: (value, row) => (
                          <CreatableComboBox
                            value={value}
                            onChange={(newValue) => handleSDLCStepChange(row.id, newValue)}
                            options={sdlcSteps}
                            placeholder="SDLC Step"
                            storageKey="sdlcStepOptions"
                          />
                        )
                      },
                      {
                        id: 'sdlcTask',
                        label: 'SDLC Task',
                        align: 'left',
                        renderer: (value, row) => (
                          <CreatableComboBox
                            value={value}
                            onChange={(newValue) => handleRowChange(row.id, "sdlcTask", newValue)}
                            options={row.sdlcStep ? sdlcTasksMap[row.sdlcStep] || [] : []}
                            placeholder="SDLC Task"
                            storageKey="sdlcTaskOptions"
                            disabled={!row.sdlcStep}
                          />
                        )
                      },
                      {
                        id: 'taskCategory',
                        label: 'Task Category',
                        align: 'left',
                        hideOnMobile: true,
                        renderer: (value, row) => (
                          <CreatableComboBox
                            value={value}
                            onChange={(newValue) => 
                              handleRowChange(row.id, "taskCategory", newValue)
                            }
                            options={[
                              "UI Development",
                              "API Integration",
                              "Code Refactoring",
                              "Documentation",
                              "Testing",
                              "Code Review",
                              "Bug Fixing",
                              "Performance Optimization",
                            ]}
                            placeholder="Task Category"
                            storageKey="taskCategoryOptions"
                          />
                        )
                      },
                      {
                        id: 'estimatedTimeWithoutAI',
                        label: 'Est (h)',
                        fixedWidth: '100px',
                        align: 'right',
                        renderer: (value, row) => (
                          <Input
                            type="number"
                            min="0"
                            step="0.25"
                            value={value}
                            onChange={(e) => 
                              handleRowChange(row.id, "estimatedTimeWithoutAI", e.target.value)
                            }
                            required
                            placeholder="Est (Hrs)"
                            style={{ width: "100px" }}
                          />
                        )
                      },
                      {
                        id: 'actualTimeWithAI',
                        label: 'Act (h)',
                        fixedWidth: '100px',
                        align: 'right',
                        renderer: (value, row) => (
                          <Input
                            type="number"
                            min="0"
                            step="0.25"
                            value={value}
                            onChange={(e) => 
                              handleRowChange(row.id, "actualTimeWithAI", e.target.value)
                            }
                            required
                            placeholder="Act (Hrs)"
                            style={{
                              width: "100px",
                              color:
                                row.estimatedTimeWithoutAI &&
                                row.actualTimeWithAI
                                  ? parseFloat(row.actualTimeWithAI) <
                                    parseFloat(row.estimatedTimeWithoutAI)
                                    ? "#16a34a"
                                    : parseFloat(row.actualTimeWithAI) >
                                        parseFloat(row.estimatedTimeWithoutAI)
                                      ? "#dc2626"
                                      : "inherit"
                                  : "inherit",
                              fontWeight:
                                row.estimatedTimeWithoutAI &&
                                row.actualTimeWithAI
                                  ? "500"
                                  : "normal",
                            }}
                          />
                        )
                      },
                      {
                        id: 'timeSaved',
                        label: 'Saved',
                        fixedWidth: '80px',
                        align: 'right',
                        hideOnMobile: true,
                        cellStyle: `
                          color: #16a34a;
                          font-weight: 500;
                        `,
                        renderer: (value, row) => (
                          <span>
                            {calculateTimeSaved(row)}
                          </span>
                        )
                      },
                      {
                        id: 'complexity',
                        label: 'Complexity',
                        align: 'left',
                        hideOnMobile: true,
                        renderer: (value, row) => (
                          <CustomSelect
                            value={value}
                            onChange={(newValue) => 
                              handleRowChange(row.id, "complexity", newValue)
                            }
                            options={["Low", "Medium", "High"]}
                            placeholder="Complexity"
                          />
                        )
                      },
                      {
                        id: 'qualityImpact',
                        label: 'Quality Impact',
                        align: 'left',
                        hideOnMobile: true,
                        renderer: (value, row) => (
                          <CreatableComboBox
                            value={value}
                            onChange={(newValue) => 
                              handleRowChange(row.id, "qualityImpact", newValue)
                            }
                            options={[
                              "Improved Readability",
                              "Better Performance",
                              "More Comprehensive",
                              "More Accurate",
                              "Higher Consistency",
                              "More Secure",
                              "Better UX",
                              "More Scalable",
                            ]}
                            placeholder="Quality Impact"
                            storageKey="qualityImpactOptions"
                          />
                        )
                      },
                      {
                        id: 'actions',
                        label: 'Action',
                        fixedWidth: '60px',
                        align: 'center',
                        renderer: (value, row) => (
                          rows.length > 1 ? (
                            <DeleteButton
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRow(row.id);
                              }}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <path d="M10 11v6"></path>
                                <path d="M14 11v6"></path>
                              </svg>
                            </DeleteButton>
                          ) : null
                        )
                      }
                    ];
                    
                    // Custom header for the table
                    const renderHeader = () => (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                        <span style={{ fontWeight: 'bold' }}>Productivity Report Entries</span>
                        <span style={{ color: '#16a34a', fontWeight: 'bold' }}>
                          Total Time Saved: {
                            rowsWithExpand
                              .reduce((sum, row) => {
                                const saved = calculateTimeSaved(row);
                                return sum + (saved !== "-" ? parseFloat(saved) : 0);
                              }, 0)
                              .toFixed(1)
                          } hrs
                        </span>
                      </div>
                    );
                    
                    return (
                      <>
                        {renderHeader()}
                        <ResponsiveTable
                          columns={formColumns}
                          data={rowsWithExpand}
                          getRowStatus={(row) => row.isExpanded ? 'expanded' : null}
                          emptyState={{
                            title: "No report entries",
                            message: "Click 'Add Entry' to add data to your report.",
                            icon: (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )
                          }}
                        />

                        {/* Expanded content - shown below each expanded row */}
                        {rowsWithExpand.map(row => (
                          row.isExpanded && (
                            <div 
                              key={`expanded-${row.id}`}
                              style={{ 
                                border: '1px solid #e5e7eb',
                                borderTop: 'none',
                                borderBottomLeftRadius: '0.5rem',
                                borderBottomRightRadius: '0.5rem',
                                marginBottom: '1rem',
                                backgroundColor: '#f8fafc'
                              }}
                            >
                              <div style={{ padding: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                  <div>
                                    <InnerLabel>Task Details</InnerLabel>
                                    <AutoResizeTextArea
                                      value={row.taskDetails}
                                      onChange={(value) => handleRowChange(row.id, "taskDetails", value)}
                                      placeholder="Enter task details..."
                                      minRows={3}
                                    />
                                  </div>
                                  <div>
                                    <InnerLabel>Notes on How AI Helped</InnerLabel>
                                    <AutoResizeTextArea
                                      value={row.notesHowAIHelped}
                                      onChange={(value) => handleRowChange(row.id, "notesHowAIHelped", value)}
                                      placeholder="Describe how AI helped with this task..."
                                      minRows={3}
                                    />
                                  </div>
                                  <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                                    <InnerLabel>AI Tools Used</InnerLabel>
                                    <CreatableMultiSelect
                                      values={row.aiToolUsed}
                                      onChange={(values) => handleRowChange(row.id, "aiToolUsed", values)}
                                      options={[
                                        "ChatGPT",
                                        "GitHub Copilot",
                                        "AWS CodeWhisperer",
                                        "Anthropic Claude",
                                        "Midjourney",
                                        "DALL-E",
                                        "Stable Diffusion",
                                        "Bing AI",
                                        "Google Bard",
                                        "HuggingChat",
                                      ]}
                                      placeholder="Select AI tools used"
                                      storageKey="aiToolOptions"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        ))}
                      </>
                    );
                  })()}
                    {/* Desktop Table View */}
                    <TableDesktop>
                      <thead>
                        <tr>
                          <th></th>
                          <th>Platform</th>
                          <th>Initiative</th>
                          <th>SDLC Step</th>
                          <th>SDLC Task</th>
                          <th>Task Category</th>
                          <th style={{ width: "100px" }}>Est (h)</th>
                          <th style={{ width: "100px" }}>Act (h)</th>
                          <th>Complexity</th>
                          <th>Quality Impact</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <React.Fragment key={row.id}>
                            <tr
                              className={`${expandedRows[row.id] ? "expanded" : ""}`}
                            >
                              <td
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpand(row.id);
                                }}
                              >
                                <div className="expand-icon">
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                  </svg>
                                </div>
                              </td>
                              <td>
                                <CreatableComboBox
                                  value={row.platform}
                                  onChange={(value) =>
                                    handleRowChange(row.id, "platform", value)
                                  }
                                  options={[
                                    "Unete",
                                    "Revamp Somos Belcorp",
                                    "Digital Catalog",
                                    "Ecommerce Platform",
                                    "Foundation Tool",
                                    "Powder Tool",
                                    "Skin Advisor",
                                    "Newapp Somos Belcorp",
                                    "FFVV",
                                  ]}
                                  placeholder="Platform"
                                  storageKey="platformOptions"
                                />
                              </td>
                              <td>
                                <CreatableComboBox
                                  value={row.projectInitiative}
                                  onChange={(value) =>
                                    handleRowChange(
                                      row.id,
                                      "projectInitiative",
                                      value,
                                    )
                                  }
                                  options={[]}
                                  placeholder="Initiative"
                                  storageKey="projectOptions"
                                />
                              </td>
                              <td>
                                <CreatableComboBox
                                  value={row.sdlcStep}
                                  onChange={(value) =>
                                    handleSDLCStepChange(row.id, value)
                                  }
                                  options={sdlcSteps}
                                  placeholder="SDLC Step"
                                  storageKey="sdlcStepOptions"
                                />
                              </td>
                              <td>
                                <CreatableComboBox
                                  value={row.sdlcTask}
                                  onChange={(value) =>
                                    handleRowChange(row.id, "sdlcTask", value)
                                  }
                                  options={
                                    row.sdlcStep
                                      ? sdlcTasksMap[row.sdlcStep] || []
                                      : []
                                  }
                                  placeholder="SDLC Task"
                                  storageKey="sdlcTaskOptions"
                                  disabled={!row.sdlcStep}
                                />
                              </td>
                              <td>
                                <CreatableComboBox
                                  value={row.taskCategory}
                                  onChange={(value) =>
                                    handleRowChange(
                                      row.id,
                                      "taskCategory",
                                      value,
                                    )
                                  }
                                  options={[
                                    "UI Development",
                                    "API Integration",
                                    "Code Refactoring",
                                    "Documentation",
                                    "Testing",
                                    "Code Review",
                                    "Bug Fixing",
                                    "Performance Optimization",
                                  ]}
                                  placeholder="Task Category"
                                  storageKey="taskCategoryOptions"
                                />
                              </td>

                              <td>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.25"
                                  value={row.estimatedTimeWithoutAI}
                                  onChange={(e) =>
                                    handleRowChange(
                                      row.id,
                                      "estimatedTimeWithoutAI",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  placeholder="Est (Hrs)"
                                  style={{ width: "100px" }}
                                />
                              </td>
                              <td>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.25"
                                  value={row.actualTimeWithAI}
                                  onChange={(e) =>
                                    handleRowChange(
                                      row.id,
                                      "actualTimeWithAI",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  placeholder="Act (Hrs)"
                                  style={{
                                    width: "100px",
                                    color:
                                      row.estimatedTimeWithoutAI &&
                                      row.actualTimeWithAI
                                        ? parseFloat(row.actualTimeWithAI) <
                                          parseFloat(row.estimatedTimeWithoutAI)
                                          ? "#16a34a"
                                          : parseFloat(row.actualTimeWithAI) >
                                              parseFloat(
                                                row.estimatedTimeWithoutAI,
                                              )
                                            ? "#dc2626"
                                            : "inherit"
                                        : "inherit",
                                    fontWeight:
                                      row.estimatedTimeWithoutAI &&
                                      row.actualTimeWithAI
                                        ? "500"
                                        : "normal",
                                  }}
                                />
                              </td>

                              <td>
                                <CustomSelect
                                  value={row.complexity}
                                  onChange={(value) =>
                                    handleRowChange(
                                      row.id,
                                      "complexity",
                                      value
                                    )
                                  }
                                  options={["Low", "Medium", "High"]}
                                  placeholder="Complexity"
                                />
                              </td>
                              <td>
                                <CreatableComboBox
                                  value={row.qualityImpact}
                                  onChange={(value) =>
                                    handleRowChange(
                                      row.id,
                                      "qualityImpact",
                                      value,
                                    )
                                  }
                                  options={[
                                    "Improved Readability",
                                    "Better Performance",
                                    "More Comprehensive",
                                    "More Accurate",
                                    "Higher Consistency",
                                    "More Secure",
                                    "Better UX",
                                    "More Scalable",
                                  ]}
                                  placeholder="Quality Impact"
                                  storageKey="qualityImpactOptions"
                                />
                              </td>

                              <td>
                                {rows.length > 1 && (
                                  <DeleteButton
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent row expansion
                                      removeRow(row.id);
                                    }}
                                  >
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M3 6h18"></path>
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                      <line
                                        x1="10"
                                        x2="10"
                                        y1="11"
                                        y2="17"
                                      ></line>
                                      <line
                                        x1="14"
                                        x2="14"
                                        y1="11"
                                        y2="17"
                                      ></line>
                                    </svg>
                                  </DeleteButton>
                                )}
                              </td>
                            </tr>

                            {expandedRows[row.id] && (
                              <tr className="detail-row">
                                <td colSpan="12">
                                  <div style={{ padding: "1rem" }}>
                                    <div style={{ marginBottom: "1rem" }}>
                                      <InnerLabel>AI TOOLS USED</InnerLabel>
                                      <CreatableMultiSelect
                                        value={row.aiToolUsed}
                                        onChange={(value) =>
                                          handleRowChange(
                                            row.id,
                                            "aiToolUsed",
                                            value,
                                          )
                                        }
                                        options={[
                                          "ChatGPT",
                                          "GitHub Copilot",
                                          "Claude",
                                          "DALL-E",
                                          "Midjourney",
                                          "Jasper",
                                          "Hugging Face",
                                          "Leonardo AI",
                                          "Bard",
                                          "GPT-4",
                                        ]}
                                        placeholder="Select AI Tools"
                                        storageKey="aiToolOptions"
                                      />
                                    </div>

                                    <div
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: "1.5rem",
                                      }}
                                    >
                                      <div>
                                        <InnerLabel>TASK DETAILS</InnerLabel>
                                        <AutoResizeTextArea
                                          value={row.taskDetails}
                                          onChange={(e) =>
                                            handleRowChange(
                                              row.id,
                                              "taskDetails",
                                              e.target.value,
                                            )
                                          }
                                          required
                                          placeholder="Enter task details..."
                                          rows={3}
                                          style={{
                                            width: "100%",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "4px",
                                            padding: "0.75rem",
                                          }}
                                        />
                                      </div>

                                      <div>
                                        <InnerLabel>NOTES</InnerLabel>
                                        <AutoResizeTextArea
                                          value={row.notesHowAIHelped}
                                          onChange={(e) =>
                                            handleRowChange(
                                              row.id,
                                              "notesHowAIHelped",
                                              e.target.value,
                                            )
                                          }
                                          required
                                          placeholder="Describe how AI helped with this task"
                                          rows={3}
                                          style={{
                                            width: "100%",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "4px",
                                            padding: "0.75rem",
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </TableDesktop>

                    {/* Summary text below the table to match the screenshot */}
                    <div
                      style={{
                        textAlign: "right",
                        padding: "12px 8px",
                        fontSize: "0.875rem",
                        color: "#6b7280",
                        fontWeight: 500,
                      }}
                    >
                      {rows.length} {rows.length === 1 ? "entry" : "entries"} |
                      Total Est (h):{" "}
                      {rows
                        .reduce(
                          (sum, row) =>
                            sum + (parseFloat(row.estimatedTimeWithoutAI) || 0),
                          0,
                        )
                        .toFixed(1)}{" "}
                      | Total Act (h):{" "}
                      {rows
                        .reduce(
                          (sum, row) =>
                            sum + (parseFloat(row.actualTimeWithAI) || 0),
                          0,
                        )
                        .toFixed(1)}
                    </div>

                    {/* Mobile Card View */}
                    <TableMobile>
                      {rows.map((row) => (
                        <MobileCard key={row.id}>
                          <MobileCardHeader>
                            Record #{rows.indexOf(row) + 1}
                          </MobileCardHeader>
                          <MobileCardBody>
                            <MobileCardField>
                              <MobileFieldLabel>Platform</MobileFieldLabel>
                              <MobileFieldValue>
                                <CreatableComboBox
                                  value={row.platform}
                                  onChange={(value) =>
                                    handleRowChange(row.id, "platform", value)
                                  }
                                  options={[
                                    "Web",
                                    "Mobile",
                                    "Desktop",
                                    "Backend",
                                    "Cloud",
                                    "Data",
                                    "Machine Learning",
                                    "DevOps",
                                    "Security",
                                    "Other",
                                  ]}
                                  placeholder="Select Platform"
                                  storageKey="platformOptions"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Initiative</MobileFieldLabel>
                              <MobileFieldValue>
                                <CreatableComboBox
                                  value={row.projectInitiative}
                                  onChange={(value) =>
                                    handleRowChange(
                                      row.id,
                                      "projectInitiative",
                                      value,
                                    )
                                  }
                                  options={[
                                    "Product Development",
                                    "Internal Tools",
                                    "Research",
                                    "Integration",
                                    "Maintenance",
                                    "Migration",
                                    "Upgrade",
                                  ]}
                                  placeholder="Select Initiative"
                                  storageKey="projectOptions"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>SDLC Step</MobileFieldLabel>
                              <MobileFieldValue>
                                <CreatableComboBox
                                  value={row.sdlcStep}
                                  onChange={(value) =>
                                    handleSDLCStepChange(row.id, value)
                                  }
                                  options={sdlcSteps}
                                  placeholder="Select Step"
                                  storageKey="sdlcStepOptions"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>SDLC Task</MobileFieldLabel>
                              <MobileFieldValue>
                                <CreatableComboBox
                                  value={row.sdlcTask}
                                  onChange={(value) =>
                                    handleRowChange(row.id, "sdlcTask", value)
                                  }
                                  options={
                                    row.sdlcStep
                                      ? sdlcTasksMap[row.sdlcStep] || []
                                      : []
                                  }
                                  placeholder={row.sdlcStep ? "Select Task" : "Select SDLC Step first"}
                                  storageKey="sdlcTaskOptions"
                                  disabled={!row.sdlcStep}
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Task Category</MobileFieldLabel>
                              <MobileFieldValue>
                                <CreatableComboBox
                                  value={row.taskCategory}
                                  onChange={(value) =>
                                    handleRowChange(
                                      row.id,
                                      "taskCategory",
                                      value,
                                    )
                                  }
                                  options={[
                                    "UI Development",
                                    "API Integration",
                                    "Code Refactoring",
                                    "Documentation",
                                    "Testing",
                                    "Code Review",
                                    "Bug Fixing",
                                    "Performance Optimization",
                                  ]}
                                  placeholder="Select Category"
                                  storageKey="taskCategoryOptions"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Task Details</MobileFieldLabel>
                              <MobileFieldValue>
                                <AutoResizeTextArea
                                  value={row.taskDetails}
                                  onChange={(e) =>
                                    handleRowChange(
                                      row.id,
                                      "taskDetails",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  placeholder="Describe the task in detail"
                                  rows={2}
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>AI Tool Used</MobileFieldLabel>
                              <MobileFieldValue>
                                <CreatableMultiSelect
                                  value={row.aiToolUsed}
                                  onChange={(value) =>
                                    handleRowChange(row.id, "aiToolUsed", value)
                                  }
                                  options={[
                                    "ChatGPT",
                                    "GitHub Copilot",
                                    "Claude",
                                    "DALL-E",
                                    "Midjourney",
                                    "Jasper",
                                    "Hugging Face",
                                    "Leonardo AI",
                                    "Bard",
                                    "GPT-4",
                                  ]}
                                  placeholder="Select AI Tools"
                                  storageKey="aiToolOptions"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Est (h)</MobileFieldLabel>
                              <MobileFieldValue>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.25"
                                  value={row.estimatedTimeWithoutAI}
                                  onChange={(e) =>
                                    handleRowChange(
                                      row.id,
                                      "estimatedTimeWithoutAI",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  placeholder="Hours"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Act (h)</MobileFieldLabel>
                              <MobileFieldValue>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.25"
                                  value={row.actualTimeWithAI}
                                  onChange={(e) =>
                                    handleRowChange(
                                      row.id,
                                      "actualTimeWithAI",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  placeholder="Hours"
                                  style={{
                                    color:
                                      row.estimatedTimeWithoutAI &&
                                      row.actualTimeWithAI
                                        ? parseFloat(row.actualTimeWithAI) <
                                          parseFloat(row.estimatedTimeWithoutAI)
                                          ? "#16a34a"
                                          : parseFloat(row.actualTimeWithAI) >
                                              parseFloat(
                                                row.estimatedTimeWithoutAI,
                                              )
                                            ? "#dc2626"
                                            : "inherit"
                                        : "inherit",
                                    fontWeight:
                                      row.estimatedTimeWithoutAI &&
                                      row.actualTimeWithAI
                                        ? "500"
                                        : "normal",
                                  }}
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Complexity</MobileFieldLabel>
                              <MobileFieldValue>
                                <CustomSelect
                                  value={row.complexity}
                                  onChange={(value) =>
                                    handleRowChange(
                                      row.id,
                                      "complexity",
                                      value
                                    )
                                  }
                                  options={["Low", "Medium", "High"]}
                                  placeholder="Select Complexity"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>
                                Quality Impact
                              </MobileFieldLabel>
                              <MobileFieldValue>
                                <CreatableComboBox
                                  value={row.qualityImpact}
                                  onChange={(value) =>
                                    handleRowChange(
                                      row.id,
                                      "qualityImpact",
                                      value,
                                    )
                                  }
                                  options={[
                                    "Improved Readability",
                                    "Better Performance",
                                    "More Comprehensive",
                                    "More Accurate",
                                    "Higher Consistency",
                                    "More Secure",
                                    "Better UX",
                                    "More Scalable",
                                  ]}
                                  placeholder="Select Impact"
                                  storageKey="qualityImpactOptions"
                                />
                              </MobileFieldValue>
                            </MobileCardField>

                            <MobileCardField>
                              <MobileFieldLabel>Notes</MobileFieldLabel>
                              <MobileFieldValue>
                                <AutoResizeTextArea
                                  value={row.notesHowAIHelped}
                                  onChange={(e) =>
                                    handleRowChange(
                                      row.id,
                                      "notesHowAIHelped",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  placeholder="Describe how AI helped with this task"
                                  rows={2}
                                />
                              </MobileFieldValue>
                            </MobileCardField>
                          </MobileCardBody>

                          {rows.length > 1 && (
                            <MobileActions>
                              <DeleteButton onClick={() => removeRow(row.id)}>
                                Remove
                              </DeleteButton>
                            </MobileActions>
                          )}
                        </MobileCard>
                      ))}

                      {/* Summary text for mobile to match the screenshot */}
                      <div
                        style={{
                          textAlign: "right",
                          padding: "12px 8px",
                          fontSize: "0.875rem",
                          color: "#6b7280",
                          fontWeight: 500,
                          marginTop: "8px",
                        }}
                      >
                        {rows.length} {rows.length === 1 ? "entry" : "entries"}{" "}
                        | Total Est (h):{" "}
                        {rows
                          .reduce(
                            (sum, row) =>
                              sum +
                              (parseFloat(row.estimatedTimeWithoutAI) || 0),
                            0,
                          )
                          .toFixed(1)}{" "}
                        | Total Act (h):{" "}
                        {rows
                          .reduce(
                            (sum, row) =>
                              sum + (parseFloat(row.actualTimeWithAI) || 0),
                            0,
                          )
                          .toFixed(1)}
                      </div>
                    </TableMobile>
                    
                    {/* 
                    NOTE: We're gradually migrating from the legacy table structure 
                    to the new ResponsiveTable component. The commented section 
                    below shows the old implementation for reference.
                    */}
                    
                  <ButtonRow>
                    <ActionButton type="button" onClick={addRow}>
                      <AddIcon>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M8 12h8"></path>
                          <path d="M12 8v8"></path>
                        </svg>
                      </AddIcon>
                      Add Entry
                    </ActionButton>

                    <SubmitButton type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Report"}
                    </SubmitButton>
                  </ButtonRow>
                </ReportForm>
              )}
            </>
          )}

          <Link href={`/view/${id}`}>
            <BackLinkText>← Back to inbox</BackLinkText>
          </Link>
        </ContentContainer>
      </Container>
    </>
  );
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps() {
  return {
    props: {},
  };
}

export default ReportPage;
