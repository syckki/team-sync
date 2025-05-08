import { useState, useEffect } from "react";
import { mergeDataValue } from "../../lib/mergeUtils";

/**
 * Custom hook for managing reference data
 * Handles fetching, synchronization, and updates for reference data
 */
const useReferenceData = () => {
  // Reference data state
  const [referenceData, setReferenceData] = useState({
    platforms: [],
    projectInitiatives: [],
    sdlcSteps: [],
    sdlcTasksMap: {},
    taskCategories: [],
    complexityLevels: [],
    qualityImpacts: [],
    aiTools: [],
    teamRoles: [],
    teamMembers: [],
  });

  /**
   * Get all reference data from the API
   * @returns {Promise<Object>} Reference data object
   */
  const getAllReferenceData = async () => {
    try {
      const response = await fetch("/api/reference-data");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch reference data");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching reference data:", error);
      // Return null to indicate an error
      return null;
    }
  };

  /**
   * Update a specific reference data category
   * @param {string} category - The category to update
   * @param {Array|Object} data - The new data for the category
   * @returns {Promise<boolean>} Success indicator
   */
  const updateAllReferenceData = async (data) => {
    try {
      console.log("Updating reference data:", data);
      /*
      const response = await fetch(`/api/reference-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update reference data");
      }
      */
      return true;
    } catch (error) {
      console.error("Error updating reference data", error);
      return false;
    }
  };

  const updateData = async () => {
    const newData = { altered: {} };

    try {
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

      // For each storage key, check if there are additional items to sync
      for (const [storageKey, categoryName] of Object.entries(storageKeyMap)) {
        const storedItems = JSON.parse(
          localStorage.getItem(storageKey) || "[]",
        );
        const alteredItems = JSON.parse(
          localStorage.getItem(`${storageKey}-altered`) || "[]",
        );

        newData[categoryName] = storedItems;
        if (alteredItems.length > 0) {
          newData.altered[categoryName] = alteredItems;
          hasUpdates = true;
        }
      }

      const categoryName = "sdlcTasksMap";
      const storageKey = "sdlcTaskOptionsMap";

      const storedTaskMap = JSON.parse(
        localStorage.getItem(storageKey) || "{}",
      );
      const alteredTaskMap = JSON.parse(
        localStorage.getItem(`${storageKey}-altered`) || "{}",
      );

      const updatedTasksMap = {};

      // Check for each step if there are new tasks
      Object.entries(storedTaskMap).forEach(([step, tasks]) => {
        const alteredTasks = alteredTaskMap[step] || [];

        updatedTasksMap[step] = tasks;
        if (alteredTasks.length > 0) {
          newData.altered[categoryName] = newData.altered[categoryName] || {};
          newData.altered[categoryName][step] = alteredTasks;
          hasUpdates = true;
        }
      });

      newData[categoryName] = updatedTasksMap;

      if (!hasUpdates) return;

      await updateAllReferenceData(newData);
    } catch (error) {
      console.error("Error synchronizing reference data:", error);
    }
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
        const storedItems = JSON.parse(
          localStorage.getItem(storageKey) || "[]",
        );

        const alteredItems = JSON.parse(
          localStorage.getItem(`${storageKey}-altered`) || "[]",
        );

        // Merge items
        const mergedItems = mergeDataValue(apiItems, storedItems, alteredItems);

        // Update localStorage
        localStorage.setItem(storageKey, JSON.stringify(mergedItems));
        localStorage.removeItem(`${storageKey}-altered`);
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
          const alteredTasks = alteredTaskMap[step] || [];

          updatedTaskMap[step] = mergeDataValue(
            tasks,
            existingTasks,
            alteredTasks,
          );
        });

        // Update localStorage
        localStorage.setItem(storageKey, JSON.stringify(updatedTaskMap));
        localStorage.removeItem(`${storageKey}-altered`);
        newData[categoryName] = updatedTaskMap;
      }
    } catch (error) {
      console.error("Error updating localStorage from API:", error);
    }

    return newData;
  };

  // Fetch reference data on hook mount and synchronize with localStorage
  useEffect(() => {
    const fetchReferenceData = async () => {
      const data = await getAllReferenceData();

      if (data) {
        const mergedData = mergeData(data);
        setReferenceData(mergedData);
      }
    };

    fetchReferenceData();
  }, []);

  return {
    referenceData,
    updateData,
  };
};

export default useReferenceData;
