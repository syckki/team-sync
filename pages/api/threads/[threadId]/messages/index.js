import { addMessageToThread, getThreadMessages, getMessagesByAuthor } from '../../../../../lib/thread';

// Configure the API route to handle binary data
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  const { threadId } = req.query;
  const authorId = req.query.authorId || req.headers['x-author-id'];

  if (!threadId) {
    return res.status(400).json({ error: 'Thread ID is required' });
  }

  // GET request - fetch messages for a thread
  if (req.method === 'GET') {
    try {
      let messages;

      // If authorId is provided, filter messages by author
      if (authorId) {
        messages = await getMessagesByAuthor(threadId, authorId);
      } else {
        // Otherwise get all messages in the thread
        messages = await getThreadMessages(threadId);
      }
      
      if (!messages || messages.length === 0) {
        return res.status(404).json({ error: 'Thread not found or empty' });
      }
      
      return res.status(200).json({
        threadId,
        messageCount: messages.length,
        messages: messages.map(msg => ({
          index: msg.index,
          data: msg.data.toString('base64'),
          metadata: msg.metadata
        }))
      });
    } catch (error) {
      console.error('Error retrieving thread messages:', error);
      return res.status(500).json({ error: 'Error retrieving thread messages' });
    }
  }
  
  // POST request - add message to an existing thread
  if (req.method === 'POST') {
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
            
            // Create metadata object with author ID
            const metadata = { authorId };
            
            // Add the message to the thread
            const threadInfo = await addMessageToThread(threadId, buffer, metadata);
            
            res.status(201).json({ 
              success: true, 
              threadId: threadInfo.threadId,
              messageIndex: threadInfo.messageIndex,
              totalMessages: threadInfo.totalMessages 
            });
            resolve();
          } catch (error) {
            console.error('Message addition error:', error);
            res.status(500).json({ error: 'Error adding message to thread' });
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Message upload error:', error);
      return res.status(500).json({ error: 'Error uploading message to thread' });
    }
  }

  // If it's not a GET or POST request
  return res.status(405).json({ error: 'Method not allowed' });
}

export default handler;