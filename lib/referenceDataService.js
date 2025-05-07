/**
 * Service for handling reference data operations
 * This provides functions to get and update reference data
 */

import fs from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), '.data', 'referenceData.json');

/**
 * Get all reference data
 * @returns {Object} Reference data object
 */
export const getAllReferenceData = async () => {
  try {
    // Check if the file exists
    if (!fs.existsSync(DATA_FILE_PATH)) {
      console.error('Reference data file not found');
      return null;
    }

    // Read the file
    const data = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading reference data:', error);
    return null;
  }
};

/**
 * Get specific reference data category
 * @param {string} category - The category to retrieve
 * @returns {Array|Object} The requested reference data category
 */
export const getReferenceDataCategory = async (category) => {
  try {
    const allData = await getAllReferenceData();
    if (!allData) return null;
    
    return allData[category] || null;
  } catch (error) {
    console.error(`Error retrieving reference data category ${category}:`, error);
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
    // Ensure the data directory exists
    const dataDir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write the updated data to the file
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(newData, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error updating reference data:', error);
    return false;
  }
};

/**
 * Update a specific reference data category
 * @param {string} category - The category to update
 * @param {Array|Object} data - The new data for the category
 * @returns {boolean} Success indicator
 */
export const updateReferenceDataCategory = async (category, data) => {
  try {
    const allData = await getAllReferenceData();
    if (!allData) return false;
    
    // Update the specific category
    allData[category] = data;
    
    // Save all data
    return await updateReferenceData(allData);
  } catch (error) {
    console.error(`Error updating reference data category ${category}:`, error);
    return false;
  }
};

/**
 * Add a new item to a reference data array category
 * @param {string} category - The category to update
 * @param {string} item - The new item to add
 * @returns {boolean} Success indicator
 */
export const addReferenceDataItem = async (category, item) => {
  try {
    const allData = await getAllReferenceData();
    if (!allData) return false;
    
    // Ensure the category exists and is an array
    if (!Array.isArray(allData[category])) {
      console.error(`Category ${category} is not an array or doesn't exist`);
      return false;
    }
    
    // Check if the item already exists
    if (allData[category].includes(item)) {
      return true; // Item already exists, no need to add
    }
    
    // Add the item and save
    allData[category].push(item);
    return await updateReferenceData(allData);
  } catch (error) {
    console.error(`Error adding item to reference data category ${category}:`, error);
    return false;
  }
};