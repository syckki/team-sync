/**
 * In-memory storage for encrypted data
 * In a production environment, this would be replaced with a database
 */

// Map to store encrypted data with unique IDs
const encryptedDataStorage = new Map();

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
  
  // Store the data
  encryptedDataStorage.set(id, Buffer.from(data));
  
  return id;
};

/**
 * Retrieve encrypted data by ID
 * @param {string} id - Unique ID of the encrypted data
 * @returns {Buffer|null} Encrypted data or null if not found
 */
export const getEncryptedData = async (id) => {
  return encryptedDataStorage.get(id) || null;
};

/**
 * Delete encrypted data by ID
 * @param {string} id - Unique ID of the encrypted data to delete
 * @returns {boolean} True if data was deleted, false if not found
 */
export const deleteEncryptedData = async (id) => {
  return encryptedDataStorage.delete(id);
};

// Optional: Clean up old data periodically
// This would be more important in a production environment
const cleanupOldData = () => {
  // This is a simple implementation that doesn't actually do anything
  // In a real implementation, you would track creation times and delete old entries
  console.log('Storage cleanup ran, current entries:', encryptedDataStorage.size);
};

// Run cleanup every hour
setInterval(cleanupOldData, 60 * 60 * 1000);
