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
import ReportFormComponent from "../../../components/containers/ReportForm";
import ReportViewer from "../../../components/containers/ReportViewer";

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

const ContentContainer = styled.div`
  padding: 1rem;
`;

const BackLinkText = styled.a`
  color: #4e7fff;
  text-decoration: none;
  margin-top: 2rem;
  display: inline-block;

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

// Static data for SDLC steps and tasks
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

// Component to handle productivity report submissions
const ReportPage = () => {
  const router = useRouter();
  const { id, view } = router.query;
  const isViewMode = view === "true";

  // State for form fields
  const [teamName, setTeamName] = useState("");
  const [teamMember, setTeamMember] = useState("");
  const [teamMemberOptions, setTeamMemberOptions] = useState([]);
  const [teamRole, setTeamRole] = useState("");
  const [rows, setRows] = useState([
    {
      id: Date.now(),
      platform: "",
      projectInitiative: "",
      sdlcStep: "",
      sdlcTask: "",
      taskDetails: "",
      aiToolUsed: [],
      estimatedTimeWithoutAI: "",
      actualTimeWithAI: "",
      complexity: "",
      qualityImpact: "",
      notesHowAIHelped: "",
      timeSaved: "",
    },
  ]);
  const [expandedRows, setExpandedRows] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cryptoKey, setCryptoKey] = useState(null);
  const [reports, setReports] = useState([]);
  const [threadTitle, setThreadTitle] = useState("");

  useEffect(() => {
    // Only run when router is ready and id exists
    if (router.isReady && id) {
      // Extract the key from URL hash
      const keyValue = window.location.hash.substring(1);
      if (!keyValue) {
        setError("No encryption key provided. Cannot view or submit reports.");
        return;
      }

      const decryptThread = async () => {
        try {
          const cryptoKey = await importKeyFromBase64(keyValue);
          setCryptoKey(cryptoKey);

          // Set the team name from the thread ID
          const formattedName = id
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          setTeamName(formattedName);

          // If in view mode, fetch and decrypt all reports
          if (isViewMode) {
            await fetchReports(cryptoKey);
          } else {
            // For form mode, just load the team title
            const response = await fetch(`/api/download?threadId=${id}`);
            if (response.ok) {
              const data = await response.json();
              if (data.title) {
                setThreadTitle(data.title);
              }
            }
          }
        } catch (err) {
          console.error("Error decrypting thread:", err);
          setError(
            "Could not decrypt the thread data. Make sure your encryption key is correct."
          );
        }
      };

      decryptThread();
    }
  }, [router.isReady, isViewMode, id]);

  // Function to fetch and decrypt reports
  const fetchReports = async (key) => {
    try {
      // Get the author ID from localStorage or generate a new one
      let authorId = localStorage.getItem(`author-${id}`);
      if (!authorId) {
        authorId = `author-${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem(`author-${id}`, authorId);
      }

      // Fetch the thread data (this includes the reports)
      const response = await fetch(
        `/api/download?threadId=${id}&authorId=${authorId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch thread data");
      }

      const data = await response.json();
      setThreadTitle(data.title || id);

      // Process each message to extract report data
      const processedReports = [];

      for (const message of data.messages) {
        const { iv, ciphertext } = message;
        if (!iv || !ciphertext) continue;

        try {
          // Convert base64 encoded data back to buffers
          const ivBuffer = new Uint8Array(
            atob(iv)
              .split("")
              .map((c) => c.charCodeAt(0))
          );
          const ciphertextBuffer = new Uint8Array(
            atob(ciphertext)
              .split("")
              .map((c) => c.charCodeAt(0))
          );

          // Decrypt the message
          const decryptedData = await decryptData(
            ciphertextBuffer,
            key,
            ivBuffer
          );
          const messageContent = JSON.parse(decryptedData);

          // Check if this is a productivity report
          if (
            messageContent.type === "productivity-report" &&
            messageContent.data
          ) {
            processedReports.push(messageContent.data);
          }
        } catch (err) {
          console.error("Error decrypting message:", err);
          // Skip messages that can't be decrypted
          continue;
        }
      }

      setReports(processedReports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to fetch reports. Please try again later.");
    }
  };

  // Create a new unique row
  const addRow = () => {
    const newRow = {
      id: Date.now(),
      platform: "",
      projectInitiative: "",
      sdlcStep: "",
      sdlcTask: "",
      taskDetails: "",
      aiToolUsed: [],
      estimatedTimeWithoutAI: "",
      actualTimeWithAI: "",
      complexity: "",
      qualityImpact: "",
      notesHowAIHelped: "",
      timeSaved: "",
    };
    setRows([...rows, newRow]);
  };

  // Delete a row by id
  const deleteRow = (id) => {
    if (rows.length <= 1) {
      return; // Don't delete the last row
    }
    setRows(rows.filter((row) => row.id !== id));
  };

  // Handle changes in form rows
  const handleRowChange = (id, field, value) => {
    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };

        // Auto-calculate time saved if both time fields are filled
        if (
          (field === "estimatedTimeWithoutAI" || field === "actualTimeWithAI") &&
          updatedRow.estimatedTimeWithoutAI &&
          updatedRow.actualTimeWithAI
        ) {
          const estimated = parseFloat(updatedRow.estimatedTimeWithoutAI) || 0;
          const actual = parseFloat(updatedRow.actualTimeWithAI) || 0;
          updatedRow.timeSaved = Math.max(0, estimated - actual).toFixed(2);
        }

        return updatedRow;
      }
      return row;
    });

    setRows(updatedRows);
  };

  // Special handler for SDLC step changes (to reset tasks)
  const handleSDLCStepChange = (id, value) => {
    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        // Reset the SDLC task when step changes
        return {
          ...row,
          sdlcStep: value,
          sdlcTask: "", // Reset the task
        };
      }
      return row;
    });

    setRows(updatedRows);
  };

  // Toggle row expansion
  const toggleRowExpand = (id) => {
    setExpandedRows({
      ...expandedRows,
      [id]: !expandedRows[id],
    });
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!cryptoKey) {
        throw new Error("Encryption key not available");
      }

      // Validate required fields
      if (!teamName || !teamMember || !teamRole) {
        throw new Error("Please fill in all team information fields");
      }

      // Check if any rows are incomplete
      const incompleteRows = rows.filter(
        (row) =>
          !row.sdlcStep ||
          !row.actualTimeWithAI ||
          !row.estimatedTimeWithoutAI
      );

      if (incompleteRows.length > 0) {
        throw new Error(
          "Please complete all tasks with required fields (SDLC step, estimated and actual time)"
        );
      }

      // Prepare report data
      const reportData = {
        teamName,
        teamMember,
        teamRole,
        timestamp: new Date().toISOString(),
        entries: rows.map((row) => ({
          platform: row.platform,
          projectInitiative: row.projectInitiative,
          sdlcStep: row.sdlcStep,
          sdlcTask: row.sdlcTask,
          taskDetails: row.taskDetails,
          aiTool: row.aiToolUsed,
          complexity: row.complexity,
          qualityImpact: row.qualityImpact,
          notesHowAIHelped: row.notesHowAIHelped,
          hours: row.actualTimeWithAI,
          hoursSaved: row.timeSaved,
        })),
      };

      // Store previously used team member names
      const previousMembers = JSON.parse(
        localStorage.getItem("teamMemberOptions") || "[]"
      );
      if (!previousMembers.includes(teamMember)) {
        const updatedMembers = [...previousMembers, teamMember];
        localStorage.setItem(
          "teamMemberOptions",
          JSON.stringify(updatedMembers)
        );
      }

      // Create the message content
      const messageContent = {
        type: "productivity-report",
        data: reportData,
      };

      // Encrypt the message
      const messageString = JSON.stringify(messageContent);
      const messageBytes = new TextEncoder().encode(messageString);
      const { encryptedData, iv } = await encryptData(messageBytes, cryptoKey);

      // Convert to base64 for transmission
      const base64IV = btoa(
        String.fromCharCode.apply(null, new Uint8Array(iv))
      );
      const base64EncryptedData = btoa(
        String.fromCharCode.apply(null, new Uint8Array(encryptedData))
      );

      // Get author ID from local storage or create a new one
      let authorId = localStorage.getItem(`author-${id}`);
      if (!authorId) {
        authorId = `author-${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem(`author-${id}`, authorId);
      }

      // Submit the encrypted data
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId: id,
          authorId,
          iv: base64IV,
          encryptedData: base64EncryptedData,
          metadata: {
            type: "productivity-report",
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      setSuccess(true);
      setIsSubmitting(false);
      
      // Load team member options
      const storedOptions = JSON.parse(
        localStorage.getItem("teamMemberOptions") || "[]"
      );
      setTeamMemberOptions(storedOptions);
      
    } catch (err) {
      console.error("Error submitting report:", err);
      setError(err.message || "An error occurred while submitting your report");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Load team member options
    const storedOptions = JSON.parse(
      localStorage.getItem("teamMemberOptions") || "[]"
    );
    setTeamMemberOptions(storedOptions);
  }, []);

  return (
    <>
      <Head>
        <title>
          {isViewMode ? "View Productivity Reports" : "Submit Productivity Report"}
        </title>
      </Head>
      <Container>
        <HeaderBanner>
          <PageTitle>
            <LockIcon>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </LockIcon>
            {isViewMode
              ? `View Productivity Reports: ${threadTitle}`
              : `Submit Productivity Report: ${teamName}`}
          </PageTitle>
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
            <ReportViewer 
              threadTitle={threadTitle}
              reports={reports}
            />
          ) : (
            // Report submission form
            <>
              {!success && (
                <ReportFormComponent
                  teamName={teamName}
                  teamMember={teamMember}
                  teamMemberOptions={teamMemberOptions}
                  teamRole={teamRole}
                  rows={rows}
                  onSubmit={handleSubmit}
                  setTeamMember={setTeamMember}
                  setTeamRole={setTeamRole}
                  handleRowChange={handleRowChange}
                  handleSDLCStepChange={handleSDLCStepChange}
                  addRow={addRow}
                  deleteRow={deleteRow}
                  isSubmitting={isSubmitting}
                  error={error}
                  success={success}
                />
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