/**
 * User and author identity utilities
 * Handles user identity management for thread interaction
 */

/**
 * Generate a unique author ID for tracking message ownership
 * @returns {string} A unique author ID
 */
export const generateAuthorId = () => {
  return `author-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
};

/**
 * Get the current user's author ID from localStorage, or generate one if not available
 * @returns {string} The author ID for the current user
 */
export const getUserAuthorId = () => {
  // Only run in browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }

  let authorId = localStorage.getItem('encrypted-app-author-id');
  
  // If no author ID exists, generate and store a new one
  if (!authorId) {
    authorId = generateAuthorId();
    localStorage.setItem('encrypted-app-author-id', authorId);
  }
  
  return authorId;
};

/**
 * Fetch thread metadata from the API
 * @param {string} threadId - ID of the thread to fetch
 * @returns {Promise<Object>} Thread metadata including title and creator information
 */
export const fetchThreadMetadata = async (threadId) => {
  try {
    const authorId = getUserAuthorId();
    if (!authorId || !threadId) {
      throw new Error('Missing author ID or thread ID');
    }

    const response = await fetch(`/api/download?threadId=${threadId}&authorId=${authorId}`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      threadTitle: data.threadTitle || threadId,
      isCreator: data.isCreator || false,
      // Add any other relevant thread metadata here
    };
  } catch (error) {
    console.error('Error fetching thread metadata:', error);
    // Return default values if fetch fails
    return {
      threadTitle: threadId,
      isCreator: false,
    };
  }
};