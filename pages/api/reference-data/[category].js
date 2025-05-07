/**
 * API endpoint for getting or updating a specific reference data category
 */
import { 
  getReferenceDataCategory, 
  updateReferenceDataCategory,
  addReferenceDataItem
} from '../../../lib/referenceDataService';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the category from the URL
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ error: 'Category parameter is required' });
  }

  // Handle GET request - Fetch specific category
  if (req.method === 'GET') {
    try {
      const data = await getReferenceDataCategory(category);
      
      if (data === null) {
        return res.status(404).json({ error: `Category '${category}' not found` });
      }
      
      return res.status(200).json(data);
    } catch (error) {
      console.error(`Error retrieving reference data for category '${category}':`, error);
      return res.status(500).json({ error: 'Failed to retrieve reference data' });
    }
  }
  
  // Handle PUT request - Update specific category
  if (req.method === 'PUT') {
    try {
      const newData = req.body;
      
      if (!newData) {
        return res.status(400).json({ error: 'Invalid data provided' });
      }
      
      const success = await updateReferenceDataCategory(category, newData);
      
      if (!success) {
        return res.status(500).json({ error: `Failed to update category '${category}'` });
      }
      
      return res.status(200).json({ message: `Category '${category}' updated successfully` });
    } catch (error) {
      console.error(`Error updating reference data for category '${category}':`, error);
      return res.status(500).json({ error: 'Failed to update reference data' });
    }
  }
  
  // Handle POST request - Add new item to category
  if (req.method === 'POST') {
    try {
      const { item } = req.body;
      
      if (!item) {
        return res.status(400).json({ error: 'Item parameter is required' });
      }
      
      const success = await addReferenceDataItem(category, item);
      
      if (!success) {
        return res.status(500).json({ error: `Failed to add item to category '${category}'` });
      }
      
      return res.status(200).json({ message: `Item added to category '${category}' successfully` });
    } catch (error) {
      console.error(`Error adding item to reference data category '${category}':`, error);
      return res.status(500).json({ error: 'Failed to add item to reference data' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}