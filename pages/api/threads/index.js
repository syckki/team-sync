import { addMessageToThread } from '../../../lib/thread';

// Configure the API route to handle binary data
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
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
          
          // Get author ID from headers if available
          const authorId = req.headers['x-author-id'] || null;
          
          // Create metadata object with author ID
          const metadata = { authorId };
          
          // Add the message to a new thread (threadId is null for new threads)
          const threadInfo = await addMessageToThread(null, buffer, metadata);
          
          // Return the thread info
          const downloadUrl = `/view/${threadInfo.threadId}`;
          
          res.status(201).json({ 
            success: true, 
            threadId: threadInfo.threadId,
            messageIndex: threadInfo.messageIndex,
            totalMessages: threadInfo.totalMessages,
            url: downloadUrl 
          });
          resolve();
        } catch (error) {
          console.error('Thread creation error:', error);
          res.status(500).json({ error: 'Error processing thread creation' });
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Error creating thread' });
  }
}

export default handler;