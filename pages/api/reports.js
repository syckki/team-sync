import { addMessageToThread, getThreadMetadata, getThreadCreatorId } from '../../lib/thread';

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
          
          // Extract query parameters
          const { threadId } = req.query;
          
          // Get author ID from headers if available
          const authorId = req.headers['x-author-id'] || null;
          
          // Create metadata object with author ID and report flag
          const metadata = { 
            authorId,
            isReport: true  // Flag this message as an AI productivity report
          };
          
          // Add the message to a thread with isReport flag
          const threadInfo = await addMessageToThread(threadId, buffer, metadata);
          
          // Return success response
          res.status(200).json({ 
            success: true, 
            threadId: threadInfo.threadId,
            messageIndex: threadInfo.messageIndex,
            totalMessages: threadInfo.totalMessages
          });
          resolve();
        } catch (error) {
          console.error('Report processing error:', error);
          res.status(500).json({ error: 'Error processing report data' });
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Report submission error:', error);
    return res.status(500).json({ error: 'Error submitting report data' });
  }
}

export default handler;