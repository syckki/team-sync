import { useState, useEffect } from "react";

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

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError("Failed to load reference data");
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
  const updateReferenceDataCategory = async (category, data) => {
    try {
      const response = await fetch(`/api/reference-data/${category}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to update category '${category}'`
        );
      }

      // Update local state with new data
      setReferenceData(prev => ({
        ...prev,
        [category]: data
      }));

      return true;
    } catch (error) {
      console.error(
        `Error updating reference data for category '${category}':`,
        error
      );
      return false;
    }
  };

  // Synchronize localStorage data with API
  const syncReferenceDataFromLocalStorage = async () => {
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

      // For each storage key, check if there are additional items to sync
      for (const [storageKey, categoryName] of Object.entries(storageKeyMap)) {
        const storedItems = JSON.parse(
          localStorage.getItem(storageKey) || "[]"
        );

        if (storedItems.length === 0) continue;

        // Check if there are any items in localStorage that are not in the API data
        const apiItems = referenceData[categoryName] || [];
        const newItems = storedItems.filter((item) => !apiItems.includes(item));

        // If there are new items, update the API
        if (newItems.length > 0) {
          const updatedItems = [...apiItems, ...newItems];
          await updateReferenceDataCategory(categoryName, updatedItems);
        }
      }

      // Handle sdlcTasksMap separately (it's an object mapping SDLC steps to arrays of tasks)
      try {
        const sdlcTaskOptionsMap = JSON.parse(
          localStorage.getItem("sdlcTaskOptionsMap") || "{}"
        );
        let hasUpdates = false;
        const updatedTasksMap = { ...referenceData.sdlcTasksMap };

        // Check for each step if there are new tasks
        Object.entries(sdlcTaskOptionsMap).forEach(([step, tasks]) => {
          if (!Array.isArray(tasks) || tasks.length === 0) return;

          // If the step doesn't exist in the API data, create it
          if (!updatedTasksMap[step]) {
            updatedTasksMap[step] = tasks;
            hasUpdates = true;
            return;
          }

          // Check for new tasks for this step
          const apiTasks = updatedTasksMap[step] || [];
          const newTasks = tasks.filter((task) => !apiTasks.includes(task));

          if (newTasks.length > 0) {
            updatedTasksMap[step] = [...apiTasks, ...newTasks];
            hasUpdates = true;
          }
        });

        // If there were updates, save to the API
        if (hasUpdates) {
          await updateReferenceDataCategory("sdlcTasksMap", updatedTasksMap);
        }
      } catch (taskMapError) {
        console.error("Error synchronizing SDLC task map:", taskMapError);
      }
    } catch (error) {
      console.error("Error synchronizing reference data:", error);
    }
  };

  // Update localStorage from API reference data
  const updateLocalStorageFromAPI = (data) => {
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
        const apiItems = data[categoryName] || [];
        if (apiItems.length === 0) return;

        // Get existing items from localStorage
        const storedItems = JSON.parse(
          localStorage.getItem(storageKey) || "[]"
        );

        // Merge items, ensuring uniqueness
        const mergedItems = [...new Set([...storedItems, ...apiItems])];

        // Update localStorage
        localStorage.setItem(storageKey, JSON.stringify(mergedItems));
      });

      // Handle sdlcTasksMap separately
      if (data.sdlcTasksMap) {
        const existingTaskMap = JSON.parse(
          localStorage.getItem("sdlcTaskOptionsMap") || "{}"
        );
        const updatedTaskMap = { ...existingTaskMap };

        // Merge each step's tasks
        Object.entries(data.sdlcTasksMap).forEach(([step, tasks]) => {
          const existingTasks = updatedTaskMap[step] || [];
          updatedTaskMap[step] = [...new Set([...existingTasks, ...tasks])];
        });

        // Update localStorage
        localStorage.setItem(
          "sdlcTaskOptionsMap",
          JSON.stringify(updatedTaskMap)
        );
      }
    } catch (error) {
      console.error("Error updating localStorage from API:", error);
    }
  };

  // Fetch reference data on hook mount and synchronize with localStorage
  useEffect(() => {
    const fetchReferenceData = async () => {
      setIsLoading(true);
      try {
        const data = await getAllReferenceData();
        if (data) {
          setReferenceData(data);

          // First update localStorage with API data
          updateLocalStorageFromAPI(data);

          // Then synchronize any new items from localStorage back to the API
          await syncReferenceDataFromLocalStorage();
        }
      } catch (error) {
        console.error("Error fetching reference data:", error);
        setError("Failed to load reference data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferenceData();
  }, []);

  return {
    referenceData,
    isLoading,
    error,
    syncReferenceDataFromLocalStorage,
    updateReferenceDataCategory
  };
};

export default useReferenceData;