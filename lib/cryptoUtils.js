/**
 * Utility functions for client-side encryption/decryption using Web Crypto API
 */

// Generate a new 128-bit AES-GCM key
export const generateKey = async () => {
  try {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 128,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    console.error('Error generating encryption key:', error);
    throw new Error('Failed to generate encryption key');
  }
};

// Encrypt data using AES-GCM
export const encryptData = async (data, key) => {
  try {
    // Generate a random 12-byte IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Convert data to ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Encrypt the data
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      dataBuffer
    );
    
    return { ciphertext, iv };
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt data using AES-GCM
export const decryptData = async (ciphertext, key, iv) => {
  try {
    // Decrypt the data
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      ciphertext
    );
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting data:', error);
    throw new Error('Failed to decrypt data. The key may be incorrect.');
  }
};

// Export CryptoKey to Base64 JWK format
export const exportKeyToBase64 = async (key) => {
  try {
    // Export the key as JWK
    const jwk = await window.crypto.subtle.exportKey('jwk', key);
    
    // We only need the 'k' field from the JWK
    const base64Key = jwk.k;
    
    return base64Key;
  } catch (error) {
    console.error('Error exporting key:', error);
    throw new Error('Failed to export encryption key');
  }
};

// Import CryptoKey from Base64 JWK format
export const importKeyFromBase64 = async (base64Key) => {
  try {
    // Create a JWK object from the base64 key
    const jwk = {
      kty: 'oct',
      k: base64Key,
      alg: 'A128GCM',
      ext: true,
    };
    
    // Import the key
    return await window.crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'AES-GCM',
        length: 128,
      },
      false, // extractable
      ['decrypt']
    );
  } catch (error) {
    console.error('Error importing key:', error);
    throw new Error('Failed to import encryption key');
  }
};
