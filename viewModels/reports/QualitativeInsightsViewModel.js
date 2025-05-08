import React, { useState, useEffect, useMemo } from "react";
import QualitativeInsightsView from "../../views/reports/QualitativeInsightsView";

/**
 * Container component for the Qualitative Insights and Recurrent Themes report
 * Processes text data to extract insights, themes, and keywords
 */
const QualitativeInsightsViewModel = ({ reports, filters = {} }) => {
  // Additional state for text search within this report
  const [searchTerm, setSearchTerm] = useState("");

  // State to store processed insights data
  const [insightsData, setInsightsData] = useState({
    keywords: [],
    themes: [],
    comments: [],
    wordCloudData: [],
    aiTools: [],
    aiToolFrequency: {},
  });

  // Filter reports based on selected criteria
  const filteredReports = useMemo(() => {
    if (!reports || !reports.length) return [];

    return reports.filter((report) => {
      // Filter by team member if specified
      if (filters.teamMember && report.teamMember !== filters.teamMember) {
        return false;
      }

      // Filter by role if specified
      if (filters.teamRole && report.teamRole !== filters.teamRole) {
        return false;
      }

      // Additional filters can be applied here
      return true;
    });
  }, [reports, filters]);

  // Process data for the qualitative insights report
  useEffect(() => {
    if (!filteredReports || !filteredReports.length) {
      // Reset data if no reports are available
      setInsightsData({
        keywords: [],
        themes: [],
        comments: [],
        wordCloudData: [],
        aiTools: [],
        aiToolFrequency: {},
      });
      return;
    }

    // Extract all entries from all reports
    const allEntries = filteredReports.flatMap((report) =>
      report.entries.map((entry) => ({
        ...entry,
        teamMember: report.teamMember,
        teamRole: report.teamRole,
        timestamp: report.timestamp,
      })),
    );

    // Filter entries based on additional criteria in filters
    const filteredEntries = allEntries.filter((entry) => {
      if (filters.aiTool && entry.aiTool !== filters.aiTool) {
        return false;
      }
      if (filters.sdlcStep && entry.sdlcStep !== filters.sdlcStep) {
        return false;
      }
      if (filters.sdlcTask && entry.sdlcTask !== filters.sdlcTask) {
        return false;
      }
      if (filters.platform && entry.platform !== filters.platform) {
        return false;
      }

      // Additional filters can be applied here
      return true;
    });

    // Extract all comments and text data
    const textData = {
      taskDetails: [],
      aiProductivity: [],
      allText: [],
    };

    // Track AI tools used
    const aiToolsUsed = {};

    // Process each entry to extract text data
    filteredEntries.forEach((entry) => {
      // Extract task details
      if (entry.taskDetails) {
        textData.taskDetails.push(entry.taskDetails);
        textData.allText.push(entry.taskDetails);
      }

      // Extract AI productivity comments
      if (entry.aiProductivity) {
        textData.aiProductivity.push(entry.aiProductivity);
        textData.allText.push(entry.aiProductivity);
      }

      // Track AI tool usage
      const tool = entry.aiTool || "Not Specified";
      if (!aiToolsUsed[tool]) {
        aiToolsUsed[tool] = 0;
      }
      aiToolsUsed[tool] += 1;
    });

    // Prepare data for the word cloud
    const wordCloudData = generateWordCloudData(textData.allText);

    // Extract keywords from text
    const keywords = extractKeywords(textData.allText);

    // Identify themes based on text analysis
    const themes = identifyThemes(textData.allText);

    // Prepare comments with metadata for display
    const comments = filteredEntries
      .filter((entry) => entry.taskDetails || entry.aiProductivity)
      .map((entry) => ({
        id: entry.id,
        taskDetails: entry.taskDetails || "",
        aiProductivity: entry.aiProductivity || "",
        aiTool: entry.aiTool || "Not Specified",
        teamMember: entry.teamMember,
        teamRole: entry.teamRole,
        sdlcStep: entry.sdlcStep,
        sdlcTask: entry.sdlcTask,
        timestamp: entry.timestamp,
        hoursSaved: parseFloat(entry.hoursSaved) || 0,
      }))
      .sort((a, b) => b.hoursSaved - a.hoursSaved); // Sort by most time saved

    // Convert aiToolsUsed to array format for charts
    const aiToolArray = Object.entries(aiToolsUsed)
      .map(([tool, count]) => ({ tool, count }))
      .sort((a, b) => b.count - a.count);

    // Update state with processed data
    setInsightsData({
      keywords,
      themes,
      comments,
      wordCloudData,
      aiTools: aiToolArray.map((item) => item.tool),
      aiToolFrequency: aiToolsUsed,
    });
  }, [filteredReports, filters]);

  // Function to extract keywords from text
  const extractKeywords = (textArray) => {
    // This is a simplified keyword extraction
    // In a production app, this would use more sophisticated NLP

    // Combine all text
    const combinedText = textArray.join(" ").toLowerCase();

    // Remove common stop words
    const stopWords = new Set([
      "a",
      "an",
      "and",
      "are",
      "as",
      "at",
      "be",
      "by",
      "for",
      "from",
      "has",
      "he",
      "in",
      "is",
      "it",
      "its",
      "of",
      "on",
      "that",
      "the",
      "to",
      "was",
      "were",
      "will",
      "with",
      "i",
      "me",
      "my",
      "myself",
      "we",
      "our",
      "ours",
      "ourselves",
      "you",
      "your",
      "yours",
      "yourself",
      "yourselves",
      "he",
      "him",
      "his",
      "himself",
      "she",
      "her",
      "hers",
      "herself",
      "it",
      "its",
      "itself",
      "they",
      "them",
      "their",
      "theirs",
      "themselves",
      "what",
      "which",
      "who",
      "whom",
      "this",
      "that",
      "these",
      "those",
      "am",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "having",
      "do",
      "does",
      "did",
      "doing",
      "would",
      "should",
      "could",
      "ought",
      "i'm",
      "you're",
      "he's",
      "she's",
      "it's",
      "we're",
      "they're",
      "i've",
      "you've",
      "we've",
      "they've",
      "i'd",
      "you'd",
      "he'd",
      "she'd",
      "we'd",
      "they'd",
      "i'll",
      "you'll",
      "he'll",
      "she'll",
      "we'll",
      "they'll",
      "isn't",
      "aren't",
      "wasn't",
      "weren't",
      "hasn't",
      "haven't",
      "hadn't",
      "doesn't",
      "don't",
      "didn't",
      "won't",
      "wouldn't",
      "shan't",
      "shouldn't",
      "can't",
      "cannot",
      "couldn't",
      "mustn't",
      "let's",
      "that's",
      "who's",
      "what's",
      "here's",
      "there's",
      "when's",
      "where's",
      "why's",
      "how's",
      "a",
      "an",
      "the",
      "and",
      "but",
      "if",
      "or",
      "because",
      "as",
      "until",
      "while",
      "of",
      "at",
      "by",
      "for",
      "with",
      "about",
      "against",
      "between",
      "into",
      "through",
      "during",
      "before",
      "after",
      "above",
      "below",
      "to",
      "from",
      "up",
      "down",
      "in",
      "out",
      "on",
      "off",
      "over",
      "under",
      "again",
      "further",
      "then",
      "once",
      "here",
      "there",
      "when",
      "where",
      "why",
      "how",
      "all",
      "any",
      "both",
      "each",
      "few",
      "more",
      "most",
      "other",
      "some",
      "such",
      "no",
      "nor",
      "not",
      "only",
      "own",
      "same",
      "so",
      "than",
      "too",
      "very",
    ]);

    // AI-specific words to ignore
    const aiSpecificStopWords = new Set([
      "ai",
      "artificial",
      "intelligence",
      "chatgpt",
      "claude",
      "gemini",
      "copilot",
      "github",
      "tool",
      "tools",
      "used",
      "using",
      "use",
      "helped",
      "help",
      "helping",
      "task",
      "tasks",
    ]);

    // Split into words, clean them, and count frequency
    const wordFrequency = {};

    combinedText
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "") // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .forEach((word) => {
        // Clean the word
        const cleanWord = word.trim().toLowerCase();

        // Skip empty strings, stop words, and very short words
        if (
          cleanWord.length <= 2 ||
          stopWords.has(cleanWord) ||
          aiSpecificStopWords.has(cleanWord)
        ) {
          return;
        }

        // Count word frequency
        if (!wordFrequency[cleanWord]) {
          wordFrequency[cleanWord] = 0;
        }
        wordFrequency[cleanWord] += 1;
      });

    // Convert to array and sort by frequency
    return Object.entries(wordFrequency)
      .filter(([_, frequency]) => frequency > 1) // Only include words that appear multiple times
      .map(([word, frequency]) => ({ word, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 30); // Take the top 30 keywords
  };

  // Function to identify themes in the text
  const identifyThemes = (textArray) => {
    // Predefined categories to look for in the text
    const themeCategories = {
      "Code Generation": [
        "code generation",
        "generate code",
        "boilerplate",
        "scaffolding",
        "initial code",
        "skeleton",
        "template",
        "starter",
      ],
      "Test Creation": [
        "test",
        "testing",
        "unit test",
        "test case",
        "test coverage",
        "integration test",
        "automated test",
      ],
      "Bug Fixing": [
        "bug",
        "fix",
        "issue",
        "problem",
        "error",
        "debug",
        "troubleshoot",
        "resolve",
      ],
      Documentation: [
        "document",
        "documentation",
        "comment",
        "readme",
        "explain",
        "explanatory",
        "description",
      ],
      "Design Patterns": [
        "pattern",
        "design pattern",
        "architecture",
        "structure",
        "framework",
      ],
      Refactoring: [
        "refactor",
        "clean",
        "improve",
        "optimize",
        "enhancement",
        "modernize",
        "update",
      ],
      Learning: [
        "learn",
        "understand",
        "learning",
        "clarify",
        "explanation",
        "tutorial",
        "example",
      ],
      "Code Review": [
        "review",
        "feedback",
        "suggestions",
        "improvement",
        "critique",
        "assessment",
      ],
      "API Integration": [
        "api",
        "integration",
        "connect",
        "service",
        "endpoint",
        "rest",
        "graphql",
        "interface",
        "websocket",
      ],
      "UI/UX Design": [
        "ui",
        "user interface",
        "ux",
        "user experience",
        "design",
        "layout",
        "styling",
        "css",
      ],
      Database: [
        "database",
        "db",
        "sql",
        "query",
        "data model",
        "schema",
        "nosql",
        "orm",
        "relational",
      ],
      Performance: [
        "performance",
        "speed",
        "optimization",
        "fast",
        "efficient",
        "bottleneck",
        "slowdown",
        "latency",
      ],
      Security: [
        "security",
        "secure",
        "authentication",
        "authorization",
        "encrypt",
        "protection",
        "vulnerability",
      ],
      Deployment: [
        "deploy",
        "deployment",
        "ci/cd",
        "pipeline",
        "release",
        "launch",
        "production",
        "hosting",
      ],
      "Prompt Engineering": [
        "prompt",
        "instruction",
        "query",
        "prompt engineering",
        "conversation",
        "chat",
      ],
      "AI Limitations": [
        "limitation",
        "limited",
        "struggle",
        "wrong",
        "incorrect",
        "hallucination",
        "mistake",
        "error",
      ],
    };

    // Combine all text
    const combinedText = textArray.join(" ").toLowerCase();

    // Count theme mentions
    const themeCounts = {};

    // Check for each theme's keywords
    Object.entries(themeCategories).forEach(([theme, keywords]) => {
      let count = 0;

      // Count occurrences of each keyword
      keywords.forEach((keyword) => {
        // Use a regex with word boundaries to find whole word matches
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        const matches = combinedText.match(regex);
        if (matches) {
          count += matches.length;
        }
      });

      // Store the count if any keywords were found
      if (count > 0) {
        themeCounts[theme] = count;
      }
    });

    // Convert to array and sort by frequency
    return Object.entries(themeCounts)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Function to generate word cloud data
  const generateWordCloudData = (textArray) => {
    // Use the keyword extraction function to get word frequencies
    const keywords = extractKeywords(textArray);

    // Transform into the format needed for the word cloud
    return keywords.map(({ word, frequency }) => ({
      text: word,
      value: frequency,
    }));
  };

  // Filter comments based on search term
  const filteredComments = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === "") {
      return insightsData.comments;
    }

    const term = searchTerm.toLowerCase().trim();

    return insightsData.comments.filter((comment) => {
      const taskDetails = (comment.taskDetails || "").toLowerCase();
      const aiProductivity = (comment.aiProductivity || "").toLowerCase();

      return taskDetails.includes(term) || aiProductivity.includes(term);
    });
  }, [insightsData.comments, searchTerm]);

  // Handler for search term updates
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  };

  return (
    <QualitativeInsightsView
      insightsData={insightsData}
      filteredComments={filteredComments}
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      filters={filters}
    />
  );
};

export default QualitativeInsightsViewModel;
