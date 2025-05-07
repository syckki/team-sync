/**
 * Client-side service for fetching and managing reference data
 * This provides functions to interact with the reference data API
 */

/**
 * Get all reference data from the API
 * @returns {Promise<Object>} Reference data object
 */
export const getAllReferenceData = async () => {
  try {
    const response = await fetch('/api/reference-data');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch reference data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching reference data:', error);
    // Return null to indicate an error
    return null;
  }
};

/**
 * Get a specific reference data category
 * @param {string} category - The category to retrieve (e.g., 'platforms', 'sdlcSteps')
 * @returns {Promise<Array|Object>} The requested reference data
 */
export const getReferenceDataCategory = async (category) => {
  try {
    const response = await fetch(`/api/reference-data/${category}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch category '${category}'`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching reference data for category '${category}':`, error);
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
export const updateReferenceDataCategory = async (category, data) => {
  try {
    const response = await fetch(`/api/reference-data/${category}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update category '${category}'`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating reference data for category '${category}':`, error);
    return false;
  }
};

/**
 * Add an item to a reference data category
 * @param {string} category - The category to add to
 * @param {string} item - The item to add
 * @returns {Promise<boolean>} Success indicator
 */
export const addReferenceDataItem = async (category, item) => {
  try {
    const response = await fetch(`/api/reference-data/${category}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ item }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to add item to category '${category}'`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error adding item to reference data category '${category}':`, error);
    return false;
  }
};