import { getThreadMessages } from "../../lib/thread";

/**
 * API endpoint for downloading thread messages
 * 
 * @param {object} req - The HTTP request object
 * @param {object} res - The HTTP response object
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { threadId, authorId } = req.query;

    if (!threadId) {
      return res.status(400).json({ error: "Thread ID is required" });
    }

    if (!authorId) {
      return res.status(400).json({ error: "Author ID is required" });
    }

    // Get thread messages from storage
    const messages = await getThreadMessages(threadId);
    
    if (!messages || messages.length === 0) {
      // Return empty messages array rather than error
      return res.status(200).json({ messages: [] });
    }

    // Return the thread messages
    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching thread messages:", error);
    return res.status(500).json({ error: "Failed to fetch thread messages" });
  }
}