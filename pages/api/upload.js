import { addMessageToThread } from "../../lib/thread";

// Configure the API route to handle binary data
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Read the raw request body as a Buffer
    return new Promise((resolve) => {
      let data = [];
      req.on("data", (chunk) => {
        data.push(chunk);
      });

      req.on("end", async () => {
        try {
          // Combine all chunks
          const buffer = Buffer.concat(data);

          if (!buffer || buffer.length === 0) {
            res.status(400).json({ error: "No data provided" });
            return resolve();
          }

          const jsonString = buffer.toString("utf8");
          const payload = JSON.parse(jsonString);
          const dataBuffer = Buffer.from(payload.data);
          const metadata = payload.metadata;
          const { threadId, threadTitle, messageIndex } = payload;

          // If messageIndex is provided, we're updating an existing message
          // Otherwise, add a new message to the thread (creates a new thread if threadId is null)
          const threadInfo = await addMessageToThread(
            threadId,
            dataBuffer,
            metadata,
            threadTitle,
            messageIndex // Pass the messageIndex if it exists
          );

          // Return the download URL
          const downloadUrl = `/channel/${threadInfo.threadId}`;

          res.status(200).json({
            success: true,
            threadId: threadInfo.threadId,
            messageIndex: threadInfo.messageIndex,
            totalMessages: threadInfo.totalMessages,
            url: downloadUrl,
          });
          resolve();
        } catch (error) {
          console.error("Upload processing error:", error);

          // Check if this is a duplicate thread title error
          if (error.message && error.message.includes("Thread with title")) {
            res.status(409).json({
              error: error.message,
              code: "DUPLICATE_THREAD_TITLE",
            });
          } else {
            res.status(500).json({
              error: "Error processing upload data",
            });
          }
          resolve();
        }
      });
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Error uploading encrypted data" });
  }
}

export default handler;
