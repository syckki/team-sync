import { storeEncryptedData } from '../../lib/storage';
import { Readable } from 'stream';
import { Buffer } from 'buffer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read the raw request body as a Buffer
    const chunks = [];
    const reader = Readable.fromWeb(req.body);
    
    for await (const chunk of reader) {
      chunks.push(Buffer.from(chunk));
    }
    
    // Combine all chunks
    const data = Buffer.concat(chunks);
    
    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }
    
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
    bodyParser: false,
  },
};
