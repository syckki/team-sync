/**
 * Utility functions for client-side encryption/decryption using Web Crypto API
 */

// Generate a new 128-bit AES-GCM key
export const generateKey = async () => {
  try {
    return await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 128,
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("Error generating encryption key:", error);
    throw new Error("Failed to generate encryption key");
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
        name: "AES-GCM",
        iv,
      },
      key,
      dataBuffer
    );

    return { ciphertext, iv };
  } catch (error) {
    console.error("Error encrypting data:", error);
    throw new Error("Failed to encrypt data");
  }
};

// Decrypt data using AES-GCM
export const decryptData = async (ciphertext, key, iv) => {
  try {
    // Decrypt the data
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      ciphertext
    );

    return decrypted;
  } catch (error) {
    console.error("Error decrypting data:", error);
    throw new Error("Failed to decrypt data. The key may be incorrect.");
  }
};

// Export CryptoKey to Base64 JWK format
export const exportKeyToBase64 = async (key) => {
  try {
    // Export the key as JWK
    const jwk = await window.crypto.subtle.exportKey("jwk", key);

    // We only need the 'k' field from the JWK
    const base64Key = jwk.k;

    return base64Key;
  } catch (error) {
    console.error("Error exporting key:", error);
    throw new Error("Failed to export encryption key");
  }
};

// Import CryptoKey from Base64 JWK format
export const importKeyFromBase64 = async (base64Key) => {
  try {
    // Create a JWK object from the base64 key
    const jwk = {
      kty: "oct",
      k: base64Key,
      alg: "A128GCM",
      ext: true,
    };

    // Import the key with both encrypt and decrypt permissions
    return await window.crypto.subtle.importKey(
      "jwk",
      jwk,
      {
        name: "AES-GCM",
        length: 128,
      },
      false, // extractable
      ["encrypt", "decrypt"] // Allow both encryption and decryption with the same key
    );
  } catch (error) {
    console.error("Error importing key:", error);
    throw new Error("Failed to import encryption key");
  }
};

export const encryptDataToByteArray = async (keyFragment, data) => {
  // Import the key to use for encryption
  const cryptoKey = await importKeyFromBase64(keyFragment);

  // Encrypt the data (as string)
  const jsonData = JSON.stringify(data);
  const { ciphertext, iv } = await encryptData(jsonData, cryptoKey);

  // Combine IV and ciphertext into a single Uint8Array
  const combinedData = new Uint8Array(iv.length + ciphertext.byteLength);
  combinedData.set(iv, 0);
  combinedData.set(new Uint8Array(ciphertext), iv.length);

  // Return as regular array (e.g., for JSON serialization or upload)
  return Array.from(combinedData);
};

export const decryptDataFromByteArray = async (keyFragment, data) => {
  // Import the key to use for encryption
  const cryptoKey = await importKeyFromBase64(keyFragment);

  // Convert base64 data back to ArrayBuffer
  const encryptedBytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));

  // Extract IV and ciphertext
  const iv = encryptedBytes.slice(0, 12);
  const ciphertext = encryptedBytes.slice(12);

  // Decrypt the data
  const decrypted = await decryptData(ciphertext, cryptoKey, iv);

  // Parse the decrypted JSON
  const parsedData = JSON.parse(new TextDecoder().decode(decrypted));

  return parsedData;
};

export const getEncryptedAuthorId = () => {
  let authorId = null;

  if (typeof window !== "undefined") {
    // Generate or retrieve author ID from localStorage
    authorId = localStorage.getItem("encrypted-app-author-id");

    if (!authorId) {
      authorId = `author-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem("encrypted-app-author-id", authorId);
    }
  }

  return authorId;
};

export const getAllParamsFromURL = (path) => {
  const fakeBase = "https://jhonnymorales.dev"; // used to parse relative URL paths
  const url = new URL(path, fakeBase);
  const toObject = (searchParams) => Object.fromEntries(searchParams.entries());

  const fromQueryString = toObject(url.searchParams);
  const fromURIFragment = toObject(new URLSearchParams(url.hash.slice(1)));

  // in case of duplicate keys, the last one wins
  return { ...fromQueryString, ...fromURIFragment };
};
