import {
  getCategoryReferenceData,
  updateCategoryReferenceData
} from "../../../lib/referenceData";

/**
 * API handler for category-specific reference data operations
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (for CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Get category from the URL
  const { category } = req.query;
  
  // Handle GET request - Return category-specific data
  if (req.method === 'GET') {
    try {
      const categoryData = await getCategoryReferenceData(category);
      
      if (!categoryData) {
        return res.status(404).json({ error: `Category '${category}' not found` });
      }
      
      return res.status(200).json(categoryData);
    } catch (error) {
      console.error(`Error retrieving category data for ${category}:`, error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Handle PUT request - Update category-specific data
  if (req.method === 'PUT') {
    try {
      const updatedCategoryData = req.body;
      
      // Validate the data
      if (!updatedCategoryData) {
        return res.status(400).json({ error: 'Invalid data format.' });
      }
      
      // Update the category data
      const success = await updateCategoryReferenceData(category, updatedCategoryData);
      
      if (success) {
        return res.status(200).json({ 
          message: `Category '${category}' updated successfully`
        });
      } else {
        return res.status(500).json({ error: `Failed to update category '${category}'` });
      }
    } catch (error) {
      console.error(`Error updating category data for ${category}:`, error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Handle any other HTTP method
  return res.status(405).json({ error: 'Method not allowed' });
}