import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";

import { importKeyFromBase64, decryptData } from "../../lib/cryptoUtils";
import ReportViewerPresentation from "../../components/presentational/ReportViewer";

// Report analysis components
// Import from new viewModels structure when available
import AiImpactSummaryViewModel from "./analysis/AiImpactSummaryViewModel";
// For the rest, we're still using the container components until they're migrated
import ToolEffectivenessContainer from "../../components/containers/reports/ToolEffectivenessContainer";
import RoleTeamAnalysisContainer from "../../components/containers/reports/RoleTeamAnalysisContainer";
import SdlcAnalysisContainer from "../../components/containers/reports/SdlcAnalysisContainer";
import ComplexityQualityContainer from "../../components/containers/reports/ComplexityQualityContainer";
import QualitativeInsightsContainer from "../../components/containers/reports/QualitativeInsightsContainer";

/**
 * ViewModel for the Report Viewer
 * Handles data fetching, decryption, and state management
 */
const ReportViewerViewModel = ({ keyFragment, threadTitle }) => {
  const router = useRouter();
  const { id } = router.query;

  // State for storing the decrypted reports
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for report view options
  const [selectedReport, setSelectedReport] = useState("raw"); // default to raw report view
  const [filters, setFilters] = useState({
    teamMember: "",
    teamRole: "",
    platform: "",
    sdlcStep: "",
    sdlcTask: "",
    periodType: "week",
  });
  
  // Extract unique filter options from reports
  const [filterOptions, setFilterOptions] = useState({
    teamMembers: [],
    teamRoles: [],
    platforms: [],
    sdlcSteps: [],
    sdlcTasks: []
  });

  // Fetch and decrypt the reports when component mounts
  useEffect(() => {
    fetchReports();
  }, []);

  // Update filter options whenever reports change
  useEffect(() => {
    if (reports.length > 0) {
      extractFilterOptions(reports);
    }
  }, [reports]);

  // Function to fetch and decrypt reports
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

  // Extract unique filter options from the reports
  const extractFilterOptions = (reports) => {
    const options = {
      teamMembers: new Set(),
      teamRoles: new Set(),
      platforms: new Set(),
      sdlcSteps: new Set(),
      sdlcTasks: new Set()
    };

    reports.forEach(report => {
      // Add team member and role
      if (report.teamMember) options.teamMembers.add(report.teamMember);
      if (report.teamRole) options.teamRoles.add(report.teamRole);
      
      // Add platforms, SDLC steps, and SDLC tasks from each entry
      report.entries.forEach(entry => {
        if (entry.platform) options.platforms.add(entry.platform);
        if (entry.sdlcStep) options.sdlcSteps.add(entry.sdlcStep);
        if (entry.sdlcTask) options.sdlcTasks.add(entry.sdlcTask);
      });
    });

    // Convert Sets to sorted Arrays
    setFilterOptions({
      teamMembers: Array.from(options.teamMembers).sort(),
      teamRoles: Array.from(options.teamRoles).sort(),
      platforms: Array.from(options.platforms).sort(),
      sdlcSteps: Array.from(options.sdlcSteps).sort(),
      sdlcTasks: Array.from(options.sdlcTasks).sort()
    });
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };

  // Handle report type selection
  const handleReportChange = (reportType) => {
    setSelectedReport(reportType);
  };

  // Render the appropriate report component based on selection
  const renderReport = () => {
    switch (selectedReport) {
      case "aiImpactSummary":
        return <AiImpactSummaryViewModel reports={reports} filters={filters} />;
      case "toolEffectiveness":
        return <ToolEffectivenessContainer reports={reports} filters={filters} />;
      case "roleTeamAnalysis":
        return <RoleTeamAnalysisContainer reports={reports} filters={filters} />;
      case "sdlcAnalysis":
        return <SdlcAnalysisContainer reports={reports} filters={filters} />;
      case "complexityQuality":
        return <ComplexityQualityContainer reports={reports} filters={filters} />;
      case "qualitativeInsights":
        return <QualitativeInsightsContainer reports={reports} filters={filters} />;
      case "raw":
      default:
        // The raw reports will be handled in the presentation component
        return null;
    }
  };

  return (
    <ReportViewerPresentation
      threadTitle={threadTitle}
      reports={reports}
      isLoading={isLoading}
      error={error}
      selectedReport={selectedReport}
      onReportChange={handleReportChange}
      filters={filters}
      onFilterChange={handleFilterChange}
      filterOptions={filterOptions}
      customReport={renderReport()}
    />
  );
};

export default ReportViewerViewModel;