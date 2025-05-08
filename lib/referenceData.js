/**
 * Service for handling reference data operations
 * This provides functions to get and update reference data
 */

import fs from "fs";
import path from "path";

const DATA_FILE_PATH = path.join(process.cwd(), ".data", "referenceData.json");

/**
 * Get all reference data
 * @returns {Object} Reference data object
 */
export const getAllReferenceData = async () => {
  try {
    // Check if the file exists
    if (!fs.existsSync(DATA_FILE_PATH)) {
      console.error("Reference data file not found");
      return null;
    }

    // Read the file
    const data = fs.readFileSync(DATA_FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading reference data:", error);
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
    const allData = await getAllReferenceData();
    if (!allData) return false;

    // Combine existing data with new data

    const combinedData = {
      ...allData,
      ...newData,
      sdlcTasksMap: {
        ...allData.sdlcTasksMap,
        ...newData.sdlcTasksMap,
      },
    }

    // Ensure the data directory exists
    const dataDir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write the updated data to the file
    fs.writeFileSync(
      DATA_FILE_PATH,
      JSON.stringify(combinedData, null, 2),
      "utf8",
    );
    return true;
  } catch (error) {
    console.error("Error updating reference data:", error);
    return false;
  }
};
