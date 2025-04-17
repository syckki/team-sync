/**
 * File-based storage for encrypted data
 * In a production environment, this would be replaced with a database
 */
import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';

// Create a data directory if it doesn't exist
const DATA_DIR = path.join(process.cwd(), '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate a unique ID
const generateUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomStr}`;
};

/**
 * Store encrypted data and return a unique ID
 * @param {ArrayBuffer|Uint8Array} data - Encrypted data to store
 * @returns {string} Unique ID for retrieving the data
 */
export const storeEncryptedData = async (data) => {
  // Generate a unique ID for this encrypted data
  const id = generateUniqueId();
  
  // Store the data to file
  const filePath = path.join(DATA_DIR, `${id}.bin`);
  fs.writeFileSync(filePath, Buffer.from(data));
  
  // Log for debugging
  console.log(`Stored encrypted data with ID: ${id}, size: ${Buffer.from(data).length} bytes`);
  
  return id;
};

/**
 * Retrieve encrypted data by ID
 * @param {string} id - Unique ID of the encrypted data
 * @returns {Buffer|null} Encrypted data or null if not found
 */
export const getEncryptedData = async (id) => {
  try {
    const filePath = path.join(DATA_DIR, `${id}.bin`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File not found for ID: ${id}`);
      return null;
    }
    
    // Read and return the data
    const data = fs.readFileSync(filePath);
    console.log(`Retrieved encrypted data with ID: ${id}, size: ${data.length} bytes`);
    return data;
  } catch (error) {
    console.error(`Error retrieving data for ID ${id}:`, error);
    return null;
  }
};

/**
 * Delete encrypted data by ID
 * @param {string} id - Unique ID of the encrypted data to delete
 * @returns {boolean} True if data was deleted, false if not found
 */
export const deleteEncryptedData = async (id) => {
  try {
    const filePath = path.join(DATA_DIR, `${id}.bin`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting data for ID ${id}:`, error);
    return false;
  }
};

// Optional: Clean up old data periodically
// This would be more important in a production environment
const cleanupOldData = () => {
  try {
    // Get all files in the data directory
    const files = fs.readdirSync(DATA_DIR);
    
    // Current time in milliseconds
    const now = Date.now();
    
    // 24 hours in milliseconds
    const DAY_MS = 24 * 60 * 60 * 1000;
    
    // Loop through each file
    let deletedCount = 0;
    for (const file of files) {
      if (file.endsWith('.bin')) {
        const filePath = path.join(DATA_DIR, file);
        
        // Get file stats
        const stats = fs.statSync(filePath);
        
        // If file is older than 24 hours, delete it
        if (now - stats.mtimeMs > DAY_MS) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    }
    
    console.log(`Storage cleanup ran, deleted ${deletedCount} old entries`);
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupOldData, 60 * 60 * 1000);
