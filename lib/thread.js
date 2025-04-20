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
 * @param {string} threadTitle - Optional title for the thread (used when creating a new thread)
 * @returns {object} Thread info with ID and message index
 */
export const addMessageToThread = async (threadId, encryptedData, metadata = {}, threadTitle = null) => {
  // Generate a new thread ID if none provided
  if (!threadId) {
    try {
      // If no thread title is provided, check if it's in the encryptedData
      if (!threadTitle && encryptedData) {
        try {
          // First 12 bytes are IV, rest is ciphertext - we don't decrypt here
          // But we can extract metadata from the encrypted data if needed in the future
        } catch (parseError) {
          console.error('Error parsing encrypted data for thread title:', parseError);
        }
      }
      
      threadId = generateThreadId(threadTitle);
    } catch (error) {
      // If thread with this title already exists, throw the error
      throw error;
    }
  }
  
  // Use existing ID as thread ID for backwards compatibility with previous messages
  const threadDir = path.join(THREADS_DIR, threadId);
  
  // Create thread directory if it doesn't exist
  const isNewThread = !fs.existsSync(threadDir);
  if (isNewThread) {
    fs.mkdirSync(threadDir, { recursive: true });
  }
  
  // Get current message count to determine index
  const files = fs.readdirSync(threadDir).filter(f => f.endsWith('.bin'));
  const messageIndex = files.length;
  
  // Determine if this is the thread creator
  const isThreadCreator = messageIndex === 0;
  
  // Generate a unique author ID for this message if not provided
  if (!metadata.authorId) {
    metadata.authorId = generateAuthorId();
  }
  
  // If this is the creator, store that in the thread metadata
  if (isThreadCreator) {
    const threadMetaPath = path.join(threadDir, 'thread.meta.json');
    fs.writeFileSync(threadMetaPath, JSON.stringify({
      createdAt: new Date().toISOString(),
      creatorId: metadata.authorId,
      threadTitle: threadTitle || 'Untitled Thread'
    }));
  }
  
  // Save message data
  const messageFilePath = path.join(threadDir, `${messageIndex}.bin`);
  fs.writeFileSync(messageFilePath, Buffer.from(encryptedData));
  
  // Also save a copy to the legacy location for backwards compatibility
  if (isThreadCreator) {
    const legacyPath = path.join(process.cwd(), '.data', `${threadId}.bin`);
    fs.writeFileSync(legacyPath, Buffer.from(encryptedData));
  }
  
  // Add standard metadata
  const finalMetadata = {
    timestamp: new Date().toISOString(),
    authorId: metadata.authorId,
    isThreadCreator,
    ...metadata
  };
  
  // Save metadata
  const metadataPath = path.join(threadDir, `${messageIndex}.meta.json`);
  fs.writeFileSync(metadataPath, JSON.stringify(finalMetadata));
  
  console.log(`Added message ${messageIndex} to thread ${threadId} by author ${metadata.authorId}`);
  
  return {
    threadId,
    messageIndex,
    totalMessages: messageIndex + 1,
    authorId: metadata.authorId,
    isThreadCreator
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
 * Get thread creator ID
 * @param {string} threadId - The thread ID
 * @returns {string|null} The creator ID or null if not found
 */
export const getThreadCreatorId = async (threadId) => {
  const threadDir = path.join(THREADS_DIR, threadId);
  const threadMetaPath = path.join(threadDir, 'thread.meta.json');
  
  if (!fs.existsSync(threadMetaPath)) {
    // For legacy threads, the creator is unknown
    return null;
  }
  
  try {
    const metadata = JSON.parse(fs.readFileSync(threadMetaPath, 'utf8'));
    return metadata.creatorId;
  } catch (error) {
    console.error(`Error getting thread creator for ${threadId}:`, error);
    return null;
  }
};

/**
 * Get thread metadata
 * @param {string} threadId - The thread ID
 * @returns {object|null} The thread metadata or null if not found
 */
export const getThreadMetadata = async (threadId) => {
  const threadDir = path.join(THREADS_DIR, threadId);
  const threadMetaPath = path.join(threadDir, 'thread.meta.json');
  
  if (!fs.existsSync(threadMetaPath)) {
    // For legacy threads, return a basic metadata object
    return {
      threadTitle: threadId,
      createdAt: new Date().toISOString()
    };
  }
  
  try {
    const metadata = JSON.parse(fs.readFileSync(threadMetaPath, 'utf8'));
    return metadata;
  } catch (error) {
    console.error(`Error getting thread metadata for ${threadId}:`, error);
    return {
      threadTitle: threadId,
      createdAt: new Date().toISOString()
    };
  }
};

/**
 * Get messages filtered by author ID
 * @param {string} threadId - The thread ID
 * @param {string} authorId - The author ID to filter by
 * @returns {Array} Array of messages from the specified author
 */
export const getMessagesByAuthor = async (threadId, authorId) => {
  const allMessages = await getThreadMessages(threadId);
  
  if (!allMessages) {
    return null;
  }
  
  // Filter messages by the specified author ID
  return allMessages.filter(message => 
    message.metadata && message.metadata.authorId === authorId
  );
};

/**
 * Converts a string to a slug format
 * @param {string} text - The text to convert to a slug
 * @returns {string} A slug version of the text
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start
    .replace(/-+$/, '');         // Trim - from end
};

/**
 * Check if a thread ID already exists
 * @param {string} threadId - The thread ID to check
 * @returns {boolean} True if the thread exists, false otherwise
 */
const threadExists = (threadId) => {
  const threadDir = path.join(THREADS_DIR, threadId);
  const legacyFilePath = path.join(process.cwd(), '.data', `${threadId}.bin`);
  return fs.existsSync(threadDir) || fs.existsSync(legacyFilePath);
};

/**
 * Generate a thread ID from a title, or a random ID if no title is provided
 * @param {string|null} title - The title to use for the thread ID
 * @returns {string} A thread ID
 */
const generateThreadId = (title = null) => {
  // If no title provided, use the old random ID method
  if (!title) {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `thread-${timestamp}-${randomStr}`;
  }
  
  // Convert title to slug format
  const slugifiedTitle = slugify(title);
  const threadId = slugifiedTitle;
  
  // Check if this thread ID already exists
  if (threadExists(threadId)) {
    throw new Error(`Thread with title "${title}" already exists. Please contact the thread creator or choose another title.`);
  }
  
  return threadId;
};

/**
 * Generate a unique author ID for tracking message ownership
 * @returns {string} A unique author ID
 */
const generateAuthorId = () => {
  return `author-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
};