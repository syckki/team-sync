import { getThreadMessages, getLatestThreadMessage } from '../../lib/thread';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { threadId, messageIndex, getAll } = req.query;

    if (!threadId) {
      return res.status(400).json({ error: 'No thread ID provided' });
    }

    // If getAll is set to true, return all messages in the thread
    if (getAll === 'true') {
      const messages = await getThreadMessages(threadId);
      
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
    }
    
    // If messageIndex is provided, get that specific message
    if (messageIndex !== undefined) {
      const allMessages = await getThreadMessages(threadId);
      
      if (!allMessages || allMessages.length === 0) {
        return res.status(404).json({ error: 'Thread not found' });
      }
      
      const message = allMessages.find(msg => msg.index === parseInt(messageIndex));
      
      if (!message) {
        return res.status(404).json({ error: 'Message not found in thread' });
      }
      
      // Set appropriate headers for binary data
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-store');
      
      return res.status(200).send(message.data);
    }
    
    // Otherwise, get the latest message in the thread
    const latestMessage = await getLatestThreadMessage(threadId);
    
    if (!latestMessage) {
      return res.status(404).json({ error: 'Thread not found or empty' });
    }
    
    // Set appropriate headers for binary data
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    
    // Send the encrypted data of the latest message
    return res.status(200).send(latestMessage.data);
    
  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ error: 'Error downloading encrypted data' });
  }
}

export default handler;
