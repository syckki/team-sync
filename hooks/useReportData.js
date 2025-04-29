import { useState, useEffect, useMemo } from "react";
import { importKeyFromBase64, decryptData } from "../lib/cryptoUtils";

/**
 * Custom hook for fetching and managing report data
 * 
 * @param {Object} options - Hook configuration options
 * @param {string} options.threadId - The thread ID to fetch reports from
 * @param {string} options.keyValue - The encryption key as Base64 string
 * @param {Array} options.reports - Optional array of pre-loaded reports
 * @returns {Object} Report data and filtering functions
 */
const useReportData = ({ threadId, keyValue, reports: initialReports = [] }) => {
  // State
  const [reports, setReports] = useState(initialReports);
  const [isLoading, setIsLoading] = useState(initialReports.length === 0);
  const [error, setError] = useState(null);
  
  // Filters
  const [platformFilter, setPlatformFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [sdlcFilter, setSdlcFilter] = useState("");
  const [timeFrame, setTimeFrame] = useState("all");
  
  // Fetch reports when threadId or keyValue changes, only if reports were not provided
  useEffect(() => {
    if (threadId && keyValue && !reports.length) {
      fetchReports();
    } else {
      setIsLoading(false);
    }
  }, [threadId, keyValue, reports.length]);
  
  // Function to fetch and decrypt reports
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get author ID from localStorage
      const authorId = localStorage.getItem("encrypted-app-author-id");
      if (!authorId) {
        throw new Error(
          "Author ID not found. Please go back to the thread view."
        );
      }

      // Fetch all messages from the thread
      const response = await fetch(
        `/api/download?threadId=${threadId}&authorId=${authorId}`
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
  
  // Extract unique options for filters from reports
  const filterOptions = useMemo(() => {
    const platforms = new Set();
    const members = new Set();
    const sdlcSteps = new Set();
    
    reports.forEach((report) => {
      if (report.teamMember) members.add(report.teamMember);
      
      report.tasks.forEach((task) => {
        if (task.platform) platforms.add(task.platform);
        if (task.sdlcStep) sdlcSteps.add(task.sdlcStep);
      });
    });
    
    return {
      platforms: Array.from(platforms),
      members: Array.from(members),
      sdlcSteps: Array.from(sdlcSteps),
    };
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
  
  // Calculate statistics from filtered reports
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
  
  // Prepare data for table display
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
  
  return {
    // Data
    reports,
    filteredReports,
    isLoading,
    error,
    tableData,
    stats,
    
    // Filter options
    filterOptions,
    
    // Filter state and setters
    platformFilter,
    setPlatformFilter,
    memberFilter,
    setMemberFilter,
    sdlcFilter,
    setSdlcFilter,
    timeFrame,
    setTimeFrame,
    
    // Methods
    fetchReports
  };
};

export default useReportData;