import {
  getThreadMessages,
  getLatestThreadMessage,
  getMessagesByAuthor,
  getThreadCreatorId,
  getThreadMetadata,
} from "../../lib/thread";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { threadId, messageIndex, authorId, all } = req.query;

    if (!threadId) {
      return res.status(400).json({ error: "No thread ID provided" });
    }

    // Get the thread creator ID for permission checking
    const creatorId = await getThreadCreatorId(threadId);

    // Get thread metadata including title
    const threadMetadata = await getThreadMetadata(threadId);

    if (!creatorId) {
      return res.status(404).json({ error: "No messages found in this thread" });
    }

    // Check if the requesting user is the thread creator
    const isCreator = creatorId && authorId === creatorId;
    const allMessages = all !== "false";

    // Get messages based on permissions and filter parameters
    let messages = await getThreadMessages(threadId);

    if (isCreator && allMessages) {
      // Thread creator gets all messages by default unless they explicitly filter to their own
    } else {
      // Filter messages by the specified author ID
      messages = messages.filter(
        ({ metadata }) =>
          metadata &&
          (metadata.authorId === authorId || (metadata.isThreadCreator && !metadata.isReport))
      );
    }

    // If messageIndex is provided, get that specific message
    if (messageIndex !== undefined) {
      const message = messages.find((msg) => msg.index === parseInt(messageIndex));

      if (!message) {
        return res.status(404).json({ error: "Message not found in thread" });
      }

      messages = [message];
    }

    return res.status(200).json({
      threadId,
      threadTitle: threadMetadata.threadTitle || threadId,
      messageCount: messages.length,
      isCreator: isCreator,
      messages: messages.map((msg) => ({
        index: msg.index,
        data: msg.data.toString("base64"),
        metadata: msg.metadata,
      })),
    });
  } catch (error) {
    console.error("Download error:", error);
    return res.status(500).json({ error: "Error downloading encrypted data" });
  }
}

export default handler;
