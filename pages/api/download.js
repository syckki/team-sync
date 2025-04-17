import { getEncryptedData } from '../../lib/storage';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'No ID provided' });
    }

    // Retrieve the encrypted data
    const encryptedData = await getEncryptedData(id);

    if (!encryptedData) {
      return res.status(404).json({ error: 'Encrypted data not found' });
    }

    // Set appropriate headers for binary data
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    
    // Send the encrypted data
    return res.status(200).send(encryptedData);
    
  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ error: 'Error downloading encrypted data' });
  }
}
