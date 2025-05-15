import { fromPromise } from "xstate";
import { encryptDataToByteArray } from "../../lib/cryptoUtils";

/**
 * Get all reference data from the API
 * @returns {Promise<Object>} Reference data object
 */
export const fetchReferenceData = fromPromise(async () => {
  const response = await fetch("/api/reference-data");
  const data = await response.json();

  if (!response.ok) throw new Error(data.error);

  return data;
});

// Submit the report to the server
export const submitReport = fromPromise(async ({ input }) => {
  const {
    mode,
    threadId,
    authorId,
    messageIndex,
    teamName,
    teamMember,
    teamRole,
  } = input; // from context

  // Process the form data
  const reportEntries = input.rows.map((row) => ({
    ...row,
    aiToolsUsed:
      Array.isArray(row.aiToolsUsed) && row.aiToolsUsed.length > 0
        ? row.aiToolsUsed.join(", ")
        : "",
  }));

  // Create the full report object
  const reportData = {
    teamName,
    teamMember,
    teamRole,
    entries: reportEntries,
    timestamp: new Date().toISOString(),
    status: mode, // 'draft' or 'submitted'
    authorId,
  };

  // Encrypt the report data
  const encryptedData = await encryptDataToByteArray(input.key, reportData);

  // Prepare the report submission
  const submitData = {
    threadId,
    threadTitle: teamName,
    data: encryptedData,
    metadata: {
      authorId,
      isReport: true,
      timestamp: new Date().toISOString(),
      status: mode, // Add status to metadata
    },
  };

  // If we're editing an existing message, include the messageIndex
  if (messageIndex !== null) {
    submitData.messageIndex = messageIndex;
  }

  // Send to the server
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submitData),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.error);
});

// Synchronize reference data from localStorage to the backend
export const updateReferenceData = fromPromise(async () => {
  const newData = { altered: {} };

  // Map of localStorage keys to API category names
  const storageKeyMap = {
    platformOptions: "platforms",
    projectOptions: "projectInitiatives",
    sdlcStepOptions: "sdlcSteps",
    taskCategoryOptions: "taskCategories",
    qualityImpactOptions: "qualityImpacts",
    aiToolOptions: "aiTools",
    teamRoleOptions: "teamRoles",
    teamMemberOptions: "teamMembers",
  };

  let hasUpdates = false;

  try {
    // For each storage key, check if there are additional items to sync
    for (const [storageKey, categoryName] of Object.entries(storageKeyMap)) {
      const storedItems = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const alteredItems = JSON.parse(
        localStorage.getItem(`${storageKey}-altered`) || "{}",
      );

      newData[categoryName] = storedItems;
      if (Object.keys(alteredItems).length > 0) {
        newData.altered[categoryName] = alteredItems;
        localStorage.removeItem(`${storageKey}-altered`);
        hasUpdates = true;
      }
    }

    const categoryName = "sdlcTasksMap";
    const storageKey = "sdlcTaskOptionsMap";

    const storedTaskMap = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const alteredTaskMap = JSON.parse(
      localStorage.getItem(`${storageKey}-altered`) || "{}",
    );

    const updatedTasksMap = {};

    // Check for each step if there are new tasks
    Object.entries(storedTaskMap).forEach(([step, tasks]) => {
      const alteredTasks = alteredTaskMap[step] || {};

      updatedTasksMap[step] = tasks;
      if (Object.keys(alteredTasks).length > 0) {
        newData.altered[categoryName] = newData.altered[categoryName] || {};
        newData.altered[categoryName][step] = alteredTasks;

        hasUpdates = true;
      }
    });

    newData[categoryName] = updatedTasksMap;
    localStorage.removeItem(`${storageKey}-altered`);

    if (!hasUpdates) return;

    const response = await fetch(`/api/reference-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error);
  } catch (error) {
    console.error("Error synchronizing reference data:", error);
  }
});
