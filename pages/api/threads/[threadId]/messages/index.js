import { addMessageToThread, getThreadMessages } from '../../../../../lib/thread';

// Set appropriate config for handling binary data
export const config = {
  api: {
    bodyParser: false, // Need raw body for encrypted binary data
  },
};

/**
 * Handler for /api/threads/[threadId]/messages endpoint
 * GET - Get all messages in a thread
 * POST - Add a new message to an existing thread
 */
export default async function handler(req, res) {
  // Get the thread ID from the URL
  const { threadId } = req.query;

  if (!threadId) {
    return res.status(400).json({ error: 'Thread ID is required' });
  }

  // Handle GET request - retrieve all messages in the thread
  if (req.method === 'GET') {
    try {
      // Get all messages from the thread
      const messages = await getThreadMessages(threadId);

      // If there are no messages, the thread doesn't exist
      if (!messages || messages.length === 0) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      // Return the thread data with all messages
      return res.status(200).json({
        success: true,
        threadId,
        messages,
      });
    } catch (error) {
      console.error(`Error retrieving thread ${threadId}:`, error);
      return res.status(500).json({ error: 'Failed to retrieve thread messages' });
    }
  }

  // Handle POST request - add a new message to the thread
  if (req.method === 'POST') {
    try {
      // Get the author ID from headers or generate one
      const authorId = req.headers['x-author-id'] || 
        `author-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 8)}`;

      // Read the binary data from the request body
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Create metadata for this message
      const metadata = {
        authorId,
        timestamp: new Date().toISOString(),
      };

      // Add the message to the existing thread
      const { threadId: resultThreadId, messageIndex } = await addMessageToThread(
        threadId,
        buffer,
        metadata
      );

      // Return the thread ID and message index
      return res.status(201).json({
        success: true,
        threadId: resultThreadId,
        messageIndex,
        url: `/view/${resultThreadId}`
      });
    } catch (error) {
      console.error(`Error adding message to thread ${threadId}:`, error);
      return res.status(500).json({ error: 'Failed to add message to thread' });
    }
  }

  // If we get here, the method is not supported
  return res.status(405).json({ error: 'Method not allowed' });
}