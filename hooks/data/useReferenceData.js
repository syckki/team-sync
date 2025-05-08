import { useState, useEffect } from "react";

/**
 * Custom hook for managing reference data
 * Handles fetching, caching, and updating reference data
 * 
 * @returns {Object} Reference data state and functions
 */
const useReferenceData = () => {
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
    teamMembers: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load reference data from backend or localStorage on mount
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        setIsLoading(true);
        // Try to get from localStorage first for immediate display
        const cachedData = localStorage.getItem('referenceData');
        
        if (cachedData) {
          setReferenceData(JSON.parse(cachedData));
        }
        
        // Then fetch from backend to ensure we have the latest data
        const response = await fetch('/api/reference-data');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch reference data: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Update state and localStorage with latest data
        setReferenceData(data);
        localStorage.setItem('referenceData', JSON.stringify(data));
        
        setError(null);
      } catch (err) {
        console.error('Error fetching reference data:', err);
        setError(err.message);
        
        // If API fails but we have cached data, don't show error
        if (localStorage.getItem('referenceData')) {
          setError(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferenceData();
  }, []);

  /**
   * Sync new options from localStorage to backend
   * This allows new options created by the user to be saved server-side
   */
  const syncReferenceDataFromLocalStorage = async () => {
    try {
      // We'll gather all created options from their specific keys in localStorage
      const updateData = { ...referenceData };
      
      // Check for new platforms
      const platformOptions = localStorage.getItem('platformOptions');
      if (platformOptions) {
        const platforms = JSON.parse(platformOptions);
        updateData.platforms = Array.from(new Set([...updateData.platforms, ...platforms]));
      }
      
      // Check for new project initiatives
      const projectOptions = localStorage.getItem('projectOptions');
      if (projectOptions) {
        const initiatives = JSON.parse(projectOptions);
        updateData.projectInitiatives = Array.from(new Set([...updateData.projectInitiatives, ...initiatives]));
      }
      
      // Check for new task categories
      const taskCategoryOptions = localStorage.getItem('taskCategoryOptions');
      if (taskCategoryOptions) {
        const categories = JSON.parse(taskCategoryOptions);
        updateData.taskCategories = Array.from(new Set([...updateData.taskCategories, ...categories]));
      }
      
      // Check for new AI tools
      const aiToolOptions = localStorage.getItem('aiToolOptions');
      if (aiToolOptions) {
        const tools = JSON.parse(aiToolOptions);
        updateData.aiTools = Array.from(new Set([...updateData.aiTools, ...tools]));
      }
      
      // Check for new team roles
      const teamRoleOptions = localStorage.getItem('teamRoleOptions');
      if (teamRoleOptions) {
        const roles = JSON.parse(teamRoleOptions);
        updateData.teamRoles = Array.from(new Set([...updateData.teamRoles, ...roles]));
      }
      
      // Check for new team members
      const teamMemberOptions = localStorage.getItem('teamMemberOptions');
      if (teamMemberOptions) {
        const members = JSON.parse(teamMemberOptions);
        updateData.teamMembers = Array.from(new Set([...updateData.teamMembers, ...members]));
      }
      
      // Update reference data in state and localStorage
      setReferenceData(updateData);
      localStorage.setItem('referenceData', JSON.stringify(updateData));
      
      // Send the updated data to the backend
      const response = await fetch('/api/reference-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update reference data: ${response.statusText}`);
      }
      
      return true;
    } catch (err) {
      console.error('Error syncing reference data:', err);
      return false;
    }
  };

  return {
    referenceData,
    isLoading,
    error,
    syncReferenceDataFromLocalStorage
  };
};

export default useReferenceData;