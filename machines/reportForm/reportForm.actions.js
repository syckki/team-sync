import { assign } from "xstate";
import { mergeDataValue } from "../../lib/mergeUtils";

// Get a new empty row with unique ID
export const getNewRow = () => ({
  id: Date.now(),
  platform: "",
  projectInitiative: "",
  sdlcStep: "",
  sdlcTask: "",
  taskCategory: "",
  estimatedTimeWithoutAI: "",
  actualTimeWithAI: "",
  timeSaved: "", // is calculated
  complexity: "",
  qualityImpact: "",
  aiToolsUsed: [],
  taskDetails: "",
  notesHowAIHelped: "",
});

// Function to round time to the nearest quarter hour (0.00, 0.25, 0.50, 0.75)
const roundToQuarterHour = (time) => {
  const value = parseFloat(time) || 0;
  return (Math.round(value * 4) / 4).toFixed(2);
};

const mergeData = (data) => {
  const newData = structuredClone(data);

  try {
    // Map of API category names to localStorage keys
    const categoryKeyMap = {
      platforms: "platformOptions",
      projectInitiatives: "projectOptions",
      sdlcSteps: "sdlcStepOptions",
      taskCategories: "taskCategoryOptions",
      qualityImpacts: "qualityImpactOptions",
      aiTools: "aiToolOptions",
      teamRoles: "teamRoleOptions",
      teamMembers: "teamMemberOptions",
    };

    // For each API category, update localStorage
    Object.entries(categoryKeyMap).forEach(([categoryName, storageKey]) => {
      const apiItems = newData[categoryName] || [];
      if (apiItems.length === 0) return;

      // Get existing items from localStorage
      const storedItems = JSON.parse(localStorage.getItem(storageKey) || "[]");

      const alteredItems = JSON.parse(
        localStorage.getItem(`${storageKey}-altered`) || "{}",
      );

      // Merge items
      const mergedItems = mergeDataValue(apiItems, storedItems, alteredItems);

      // Update localStorage
      localStorage.setItem(storageKey, JSON.stringify(mergedItems));
      newData[categoryName] = mergedItems;
    });

    const categoryName = "sdlcTasksMap";
    const storageKey = "sdlcTaskOptionsMap";

    // Handle sdlcTasksMap separately
    if (newData[categoryName]) {
      const storedTaskMap = JSON.parse(
        localStorage.getItem(storageKey) || "{}",
      );
      const alteredTaskMap = JSON.parse(
        localStorage.getItem(`${storageKey}-altered`) || "{}",
      );
      const updatedTaskMap = structuredClone(storedTaskMap);

      // Merge each step's tasks
      Object.entries(newData[categoryName]).forEach(([step, tasks]) => {
        const existingTasks = updatedTaskMap[step] || [];
        const alteredTasks = alteredTaskMap[step] || {};

        updatedTaskMap[step] = mergeDataValue(
          tasks,
          existingTasks,
          alteredTasks,
        );
      });

      // Update localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedTaskMap));
      newData[categoryName] = updatedTaskMap;
    }
  } catch (error) {
    console.error("Error updating localStorage from API:", error);
  }

  return newData;
};

// Function to process report data (whether from URL param or direct props)
export const processReportData = assign((_, { reportData: existingReport }) => {
  if (!existingReport) return;

  const context = {};

  // Check report status - if submitted, set read-only mode
  if (existingReport.status === "submitted") {
    context.isReadOnly = true;
  }

  // Set team member and role
  context.teamMember = existingReport.teamMember;
  context.teamRole = existingReport.teamRole;

  // Load rows data if available
  if (existingReport.entries && existingReport.entries.length > 0) {
    // Map the entries to row format with unique IDs
    const loadedRows = existingReport.entries.map((entry) => ({
      id: Date.now() + Math.floor(Math.random() * 1000), // Generate unique id
      platform: entry.platform,
      projectInitiative: entry.projectInitiative,
      sdlcStep: entry.sdlcStep,
      sdlcTask: entry.sdlcTask,
      taskCategory: entry.taskCategory,
      estimatedTimeWithoutAI: entry.estimatedTimeWithoutAI,
      actualTimeWithAI: entry.actualTimeWithAI,
      complexity: entry.complexity,
      qualityImpact: entry.qualityImpact,
      aiToolsUsed: entry.aiToolsUsed
        ? Array.isArray(entry.aiToolsUsed)
          ? entry.aiToolsUsed
          : entry.aiToolsUsed.includes(",")
            ? entry.aiToolsUsed.split(",").map((t) => t.trim())
            : [entry.aiToolsUsed]
        : [],
      taskDetails: entry.taskDetails,
      notesHowAIHelped: entry.notesHowAIHelped,
    }));

    context.rows = loadedRows;
  }

  return context;
});

// Add a new row to the form
export const addRow = assign((_, { rows, expandedRows }) => {
  const newRow = getNewRow();

  return {
    rows: [...rows, newRow],
    // Automatically expand the new row
    expandedRows: { ...expandedRows, [newRow.id]: true },
  };
});

// Remove a row from the form
export const removeRow = assign((_, { rows, expandedRows, id }) => {
  const context = {};

  context.rows = rows.filter((row) => row.id !== id);
  // Also remove from expanded state
  context.expandedRows = { ...expandedRows };
  delete context.expandedRows[id];

  return context;
});

// Handle field changes in form rows
export const updateRow = assign((_, { rows, id, field, value }) => {
  return {
    rows: rows.map((row) => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };

        // Calculate time saved if both time fields are filled
        if (
          field === "estimatedTimeWithoutAI" ||
          field === "actualTimeWithAI"
        ) {
          const estimatedTime = parseFloat(
            field === "estimatedTimeWithoutAI"
              ? value
              : updatedRow.estimatedTimeWithoutAI,
          );
          const actualTime = parseFloat(
            field === "actualTimeWithAI" ? value : updatedRow.actualTimeWithAI,
          );

          if (!isNaN(estimatedTime) && !isNaN(actualTime)) {
            const timeSaved = Math.max(0, estimatedTime - actualTime);
            updatedRow.timeSaved = roundToQuarterHour(timeSaved);
          } else {
            updatedRow.timeSaved = "";
          }
        }

        if (field === "sdlcStep") {
          updatedRow.sdlcTask = ""; // Reset task when step changes
        }

        return updatedRow;
      }
      return row;
    }),
  };
});

// Toggle row expansion
export const toggleRowExpansion = assign((_, { expandedRows, id }) => {
  return {
    expandedRows: {
      ...expandedRows,
      [id]: !expandedRows[id],
    },
  };
});

// Update a field in the form context
export const updateField = assign((_, { field, value }) => {
  return { [field]: value };
});

export const setReferenceData = assign({
  referenceData: ({ event }) => {
    if (!event.output) return;

    // Merge the reference data with localStorage
    const mergedData = mergeData(event.output);
    return mergedData;
  },
});

export const notifyError = assign({
  error: ({ event }) => event.error,
});
