import { storeEncryptedData } from '../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if the request contains binary data
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }

    // Parse the request body as an ArrayBuffer
    const data = req.body;
    
    // Store the encrypted data and get a unique ID
    const id = await storeEncryptedData(data);
    
    // Return the download URL
    const downloadUrl = `/view/${id}`;
    
    return res.status(200).json({ 
      success: true, 
      id, 
      url: downloadUrl 
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Error uploading encrypted data' });
  }
}

// Configure the API route to handle binary data
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};
