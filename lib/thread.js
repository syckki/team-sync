/**
 * Thread management for encrypted messages
 * This allows multiple messages to be associated with a single thread
 */
import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';

// Create threads directory if it doesn't exist
const THREADS_DIR = path.join(process.cwd(), '.data', 'threads');
if (!fs.existsSync(THREADS_DIR)) {
  fs.mkdirSync(THREADS_DIR, { recursive: true });
}

/**
 * Create a new thread or add a message to an existing thread
 * @param {string} threadId - The thread ID (use null to create a new thread)
 * @param {Buffer} encryptedData - The encrypted message data
 * @param {object} metadata - Optional metadata about the message
 * @returns {object} Thread info with ID and message index
 */
export const addMessageToThread = async (threadId, encryptedData, metadata = {}) => {
  // Generate a new thread ID if none provided
  if (!threadId) {
    threadId = generateThreadId();
  }
  
  // Use existing ID as thread ID for backwards compatibility with previous messages
  const threadDir = path.join(THREADS_DIR, threadId);
  
  // Create thread directory if it doesn't exist
  if (!fs.existsSync(threadDir)) {
    fs.mkdirSync(threadDir, { recursive: true });
  }
  
  // Get current message count to determine index
  const files = fs.readdirSync(threadDir).filter(f => f.endsWith('.bin'));
  const messageIndex = files.length;
  
  // Save message data
  const messageFilePath = path.join(threadDir, `${messageIndex}.bin`);
  fs.writeFileSync(messageFilePath, Buffer.from(encryptedData));
  
  // Also save a copy to the legacy location for backwards compatibility
  if (messageIndex === 0) {
    const legacyPath = path.join(process.cwd(), '.data', `${threadId}.bin`);
    fs.writeFileSync(legacyPath, Buffer.from(encryptedData));
  }
  
  // Save metadata if provided
  if (Object.keys(metadata).length > 0) {
    const metadataPath = path.join(threadDir, `${messageIndex}.meta.json`);
    fs.writeFileSync(metadataPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      ...metadata
    }));
  }
  
  console.log(`Added message ${messageIndex} to thread ${threadId}`);
  
  return {
    threadId,
    messageIndex,
    totalMessages: messageIndex + 1
  };
};

/**
 * Get all messages from a thread
 * @param {string} threadId - The thread ID
 * @returns {Array} Array of message data objects with content and metadata
 */
export const getThreadMessages = async (threadId) => {
  const threadDir = path.join(THREADS_DIR, threadId);
  const legacyFilePath = path.join(process.cwd(), '.data', `${threadId}.bin`);
  
  // Check if it's a legacy file or a thread directory
  if (!fs.existsSync(threadDir)) {
    // If we have a legacy file but no thread directory, create the thread from the legacy file
    if (fs.existsSync(legacyFilePath)) {
      console.log(`Found legacy file for ${threadId}, creating thread directory`);
      
      // Read the legacy file
      const data = fs.readFileSync(legacyFilePath);
      
      // Create thread directory
      fs.mkdirSync(threadDir, { recursive: true });
      
      // Write the data to the new thread structure
      fs.writeFileSync(path.join(threadDir, '0.bin'), data);
      
      // Return a single message array with the legacy file data
      return [{
        index: 0,
        data,
        metadata: {
          timestamp: new Date().toISOString()
        }
      }];
    }
    
    // No thread or legacy file found
    return null;
  }
  
  // Get all message files sorted by index
  const files = fs.readdirSync(threadDir)
    .filter(f => f.endsWith('.bin'))
    .sort((a, b) => {
      const indexA = parseInt(a.split('.')[0]);
      const indexB = parseInt(b.split('.')[0]);
      return indexA - indexB;
    });
  
  // If no files found, but we have a legacy file, use that
  if (files.length === 0 && fs.existsSync(legacyFilePath)) {
    const data = fs.readFileSync(legacyFilePath);
    fs.writeFileSync(path.join(threadDir, '0.bin'), data);
    
    return [{
      index: 0,
      data,
      metadata: {
        timestamp: new Date().toISOString()
      }
    }];
  }
  
  // Read message data and metadata
  const messages = files.map(file => {
    const index = parseInt(file.split('.')[0]);
    const filePath = path.join(threadDir, file);
    const metadataPath = path.join(threadDir, `${index}.meta.json`);
    
    // Read encrypted data
    const data = fs.readFileSync(filePath);
    
    // Read metadata if available
    let metadata = {};
    if (fs.existsSync(metadataPath)) {
      try {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      } catch (error) {
        console.error(`Error parsing metadata for message ${index} in thread ${threadId}:`, error);
      }
    }
    
    return {
      index,
      data,
      metadata
    };
  });
  
  return messages;
};

/**
 * Get the latest message from a thread
 * @param {string} threadId - The thread ID
 * @returns {object|null} The latest message data or null if thread doesn't exist
 */
export const getLatestThreadMessage = async (threadId) => {
  const messages = await getThreadMessages(threadId);
  
  if (!messages || messages.length === 0) {
    return null;
  }
  
  return messages[messages.length - 1];
};

/**
 * Generate a unique thread ID
 * @returns {string} A unique thread ID
 */
const generateThreadId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `thread-${timestamp}-${randomStr}`;
};