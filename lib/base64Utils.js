/**
 * Utility functions for safe base64 encoding/decoding that work in both Node.js and browser environments
 */

/**
 * Safely converts a string to base64 in any environment
 * @param {string} str - The string to encode
 * @returns {string} Base64 encoded string
 */
export const safeEncode = (str) => {
  // Check for Buffer availability (Node.js)
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64');
  }
  
  // Browser environment
  try {
    return btoa(str);
  } catch (err) {
    // Fallback for non-ASCII characters
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => 
      String.fromCharCode('0x' + p1)));
  }
};

/**
 * Safely converts a base64 string to a regular string in any environment
 * @param {string} base64 - The base64 string to decode
 * @returns {string} Decoded string
 */
export const safeDecode = (base64) => {
  // Check for Buffer availability (Node.js)
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64').toString();
  }
  
  // Browser environment
  try {
    return atob(base64);
  } catch (err) {
    // Try to clean the base64 string first
    const cleaned = base64.replace(/[^A-Za-z0-9+/=]/g, '');
    try {
      return atob(cleaned);
    } catch (cleanErr) {
      throw new Error('Invalid base64 string');
    }
  }
};

/**
 * Safely converts an ArrayBuffer to a base64 string in any environment
 * @param {ArrayBuffer} buffer - The ArrayBuffer to encode
 * @returns {string} Base64 encoded string
 */
export const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  
  // Check for Buffer availability (Node.js)
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  
  // Browser environment
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  try {
    return btoa(binary);
  } catch (err) {
    throw new Error('Failed to convert ArrayBuffer to base64');
  }
};

/**
 * Safely converts a base64 string to an ArrayBuffer in any environment
 * @param {string} base64 - The base64 string to decode
 * @returns {Uint8Array} The resulting binary data as Uint8Array
 */
export const base64ToArrayBuffer = (base64) => {
  // Check for Buffer availability (Node.js)
  if (typeof Buffer !== 'undefined') {
    const buffer = Buffer.from(base64, 'base64');
    return new Uint8Array(buffer);
  }
  
  // Browser environment
  try {
    // Clean the base64 string first
    const cleaned = base64.replace(/[^A-Za-z0-9+/=]/g, '');
    const binaryString = atob(cleaned);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (err) {
    throw new Error('Failed to convert base64 to ArrayBuffer: ' + err.message);
  }
};