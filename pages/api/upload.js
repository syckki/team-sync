import { storeEncryptedData } from '../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read the raw request body as a Buffer
    return new Promise((resolve) => {
      let data = [];
      req.on('data', (chunk) => {
        data.push(chunk);
      });
      
      req.on('end', async () => {
        try {
          // Combine all chunks
          const buffer = Buffer.concat(data);
          
          if (!buffer || buffer.length === 0) {
            res.status(400).json({ error: 'No data provided' });
            return resolve();
          }
          
          // Store the encrypted data and get a unique ID
          const id = await storeEncryptedData(buffer);
          
          // Return the download URL
          const downloadUrl = `/view/${id}`;
          
          res.status(200).json({ 
            success: true, 
            id, 
            url: downloadUrl 
          });
          resolve();
        } catch (error) {
          console.error('Upload processing error:', error);
          res.status(500).json({ error: 'Error processing upload data' });
          resolve();
        }
      });
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
