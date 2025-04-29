import { addMessageToThread } from "../../lib/thread";

/**
 * API endpoint for uploading encrypted messages to a thread
 * 
 * @param {object} req - The HTTP request object
 * @param {object} res - The HTTP response object
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { threadId, data, metadata, threadTitle } = req.body;

    if (!threadId) {
      return res.status(400).json({ error: "Thread ID is required" });
    }

    if (!data) {
      return res.status(400).json({ error: "Encrypted data is required" });
    }
    
    // Convert base64 data to ArrayBuffer
    const encryptedBytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
    
    // Add message to thread
    const result = await addMessageToThread(
      threadId,
      encryptedBytes,
      metadata || {},
      threadTitle
    );

    if (!result) {
      return res.status(500).json({ error: "Failed to add message to thread" });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      threadId: result.threadId,
      messageIndex: result.messageIndex,
    });
  } catch (error) {
    console.error("Error uploading message:", error);
    return res.status(500).json({ error: "Failed to upload message" });
  }
}