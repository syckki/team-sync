/**
 * Service for handling reference data operations
 * This provides functions to get and update reference data
 */

import fs from "fs";
import path from "path";

const DATA_FILE_PATH = path.join(process.cwd(), ".data", "referenceData.json");

/**
 * Ensure the data directory exists
 * @returns {void}
 */
const ensureDataDir = () => {
  const dataDir = path.dirname(DATA_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

/**
 * Create default reference data if it doesn't exist
 * @returns {Object} Default reference data object
 */
const createDefaultReferenceData = () => {
  const defaultData = {
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
  };
  
  // Ensure the data directory exists
  ensureDataDir();
  
  // Write the default data to the file
  fs.writeFileSync(
    DATA_FILE_PATH,
    JSON.stringify(defaultData, null, 2),
    "utf8"
  );
  
  return defaultData;
};

/**
 * Get all reference data
 * @returns {Object} Reference data object
 */
export const getAllReferenceData = async () => {
  try {
    // Check if the file exists
    if (!fs.existsSync(DATA_FILE_PATH)) {
      console.log("Reference data file not found, creating default data");
      return createDefaultReferenceData();
    }

    // Read the file
    const data = fs.readFileSync(DATA_FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading reference data:", error);
    // Return empty reference data in case of error
    return {
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
    };
  }
};

/**
 * Get a specific category from reference data
 * @param {string} category - Category to retrieve
 * @returns {Object} Category data or null if not found
 */
export const getCategoryReferenceData = async (category) => {
  try {
    const allData = await getAllReferenceData();
    
    if (!allData || !(category in allData)) {
      return null;
    }
    
    return { [category]: allData[category] };
  } catch (error) {
    console.error(`Error reading reference data for category ${category}:`, error);
    return null;
  }
};

/**
 * Update reference data
 * @param {Object} newData - The new reference data (full object)
 * @returns {boolean} Success indicator
 */
export const updateReferenceData = async (newData) => {
  try {
    // Get existing data or create default
    let allData = await getAllReferenceData();
    if (!allData) {
      allData = createDefaultReferenceData();
    }

    // Combine existing data with new data
    const combinedData = {
      ...allData,
      ...newData,
      // Special handling for sdlcTasksMap which is nested
      sdlcTasksMap: {
        ...allData.sdlcTasksMap,
        ...newData.sdlcTasksMap,
      },
    };

    // Ensure the data directory exists
    ensureDataDir();

    // Write the updated data to the file
    fs.writeFileSync(
      DATA_FILE_PATH,
      JSON.stringify(combinedData, null, 2),
      "utf8"
    );
    return true;
  } catch (error) {
    console.error("Error updating reference data:", error);
    return false;
  }
};

/**
 * Update a specific category in reference data
 * @param {string} category - Category to update
 * @param {Array|Object} categoryData - New data for the category
 * @returns {boolean} Success indicator
 */
export const updateCategoryReferenceData = async (category, categoryData) => {
  try {
    // Get existing data
    const allData = await getAllReferenceData();
    if (!allData) return false;
    
    // Check if the category exists
    if (!(category in allData)) {
      console.error(`Category ${category} not found in reference data`);
      return false;
    }
    
    // Update the category data
    allData[category] = categoryData;
    
    // Write the updated data to the file
    ensureDataDir();
    fs.writeFileSync(
      DATA_FILE_PATH,
      JSON.stringify(allData, null, 2),
      "utf8"
    );
    
    return true;
  } catch (error) {
    console.error(`Error updating reference data for category ${category}:`, error);
    return false;
  }
};
