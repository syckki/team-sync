/**
 * API endpoint for getting all reference data or updating the entire reference data structure
 */
import { getAllReferenceData, updateReferenceData } from '../../../lib/referenceDataService';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET request - Fetch all reference data
  if (req.method === 'GET') {
    try {
      const data = await getAllReferenceData();
      
      if (!data) {
        return res.status(404).json({ error: 'Reference data not found' });
      }
      
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error retrieving reference data:', error);
      return res.status(500).json({ error: 'Failed to retrieve reference data' });
    }
  }
  
  // Handle POST request - Update all reference data
  if (req.method === 'POST') {
    try {
      const newData = req.body;
      
      if (!newData || Object.keys(newData).length === 0) {
        return res.status(400).json({ error: 'Invalid reference data provided' });
      }
      
      const success = await updateReferenceData(newData);
      
      if (!success) {
        return res.status(500).json({ error: 'Failed to update reference data' });
      }
      
      return res.status(200).json({ message: 'Reference data updated successfully' });
    } catch (error) {
      console.error('Error updating reference data:', error);
      return res.status(500).json({ error: 'Failed to update reference data' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}