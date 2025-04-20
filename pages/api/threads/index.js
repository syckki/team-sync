import { addMessageToThread, getLatestThreadMessage } from '../../../lib/thread';

// Set appropriate CORS headers to allow cross-origin requests
export const config = {
  api: {
    bodyParser: false, // Need raw body for encrypted binary data
  },
};

/**
 * Handler for /api/threads endpoint (thread creation)
 * POST - Create a new thread with the first encrypted message
 */
export default async function handler(req, res) {
  // Method must be POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Create metadata for the first message
    const metadata = {
      authorId,
      isThreadCreator: true, // First message always designates the thread creator
      timestamp: new Date().toISOString(),
    };

    // Create a new thread with this encrypted message
    const { threadId, messageIndex } = await addMessageToThread(
      null, // null threadId creates a new thread
      buffer,
      metadata
    );

    // Return the thread ID and URL to view the thread
    res.status(201).json({
      success: true,
      threadId,
      messageIndex,
      url: `/view/${threadId}`
    });
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ error: 'Failed to create thread' });
  }
}