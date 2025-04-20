import { getThreadMessages, getLatestThreadMessage, getMessagesByAuthor, getThreadCreatorId } from '../../lib/thread';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { threadId, messageIndex, getAll, authorId } = req.query;

    if (!threadId) {
      return res.status(400).json({ error: 'No thread ID provided' });
    }
    
    // Get thread creator information first
    const threadCreatorId = await getThreadCreatorId(threadId);
    const isThreadCreator = authorId && authorId === threadCreatorId;
    
    // If we're requesting all messages and the user is thread creator or getAll is true
    if ((isThreadCreator && getAll === 'true') || (!authorId && getAll === 'true')) {
      const messages = await getThreadMessages(threadId);
      
      if (!messages || messages.length === 0) {
        return res.status(404).json({ error: 'Thread not found or empty' });
      }
      
      return res.status(200).json({
        threadId,
        messageCount: messages.length,
        threadCreatorId,
        isThreadCreator,
        isAll: true,
        messages: messages.map(msg => ({
          index: msg.index,
          data: msg.data.toString('base64'),
          metadata: msg.metadata
        }))
      });
    }
    
    // If authorId is provided and we're not getting all messages, filter by author
    if (authorId) {
      const messages = await getMessagesByAuthor(threadId, authorId);
      
      if (!messages || messages.length === 0) {
        return res.status(404).json({ error: 'No messages found for this author' });
      }
      
      return res.status(200).json({
        threadId,
        messageCount: messages.length,
        filterType: 'author',
        authorId,
        threadCreatorId,
        isThreadCreator,
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
    
    // If neither getAll nor authorId specified, default to returning all messages
    // but with thread status info
    const messages = await getThreadMessages(threadId);
    
    if (!messages || messages.length === 0) {
      return res.status(404).json({ error: 'Thread not found or empty' });
    }
    
    return res.status(200).json({
      threadId,
      messageCount: messages.length,
      threadCreatorId,
      messages: messages.map(msg => ({
        index: msg.index,
        data: msg.data.toString('base64'),
        metadata: msg.metadata
      }))
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ error: 'Error downloading encrypted data' });
  }
}

export default handler;
