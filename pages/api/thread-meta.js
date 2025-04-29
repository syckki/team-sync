import { getThreadMetadata } from "../../lib/thread";

/**
 * API endpoint for fetching thread metadata
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
    const { threadId } = req.query;

    if (!threadId) {
      return res.status(400).json({ error: "Thread ID is required" });
    }

    // Get thread metadata from the lib/thread.js utility
    const metadata = await getThreadMetadata(threadId);
    
    if (!metadata) {
      return res.status(404).json({ error: "Thread not found" });
    }

    // Return the thread metadata (particularly the title)
    return res.status(200).json({
      id: threadId,
      title: metadata.title || threadId,
      // Include other non-sensitive metadata as needed
      createdAt: metadata.createdAt,
    });
  } catch (error) {
    console.error("Error fetching thread metadata:", error);
    return res.status(500).json({ error: "Failed to fetch thread metadata" });
  }
}