/**
 * Inbox utilities for managing and accessing thread information
 */

/**
 * Get all threads that have been visited from localStorage
 * @returns {Array} Array of thread objects with id, title, and lastVisited properties
 */
export const getVisitedThreads = () => {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const threadHistory = localStorage.getItem('encrypted-app-thread-history');
    if (!threadHistory) {
      return [];
    }
    
    return JSON.parse(threadHistory) || [];
  } catch (error) {
    console.error('Error retrieving thread history:', error);
    return [];
  }
};

/**
 * Save a thread to the history in localStorage
 * @param {string} threadId - The ID of the thread
 * @param {string} title - The title of the thread
 * @param {string} url - The URL of the thread (with encryption key)
 * @returns {boolean} Success indicator
 */
export const saveThreadToHistory = (threadId, title, url) => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const threads = getVisitedThreads();
    
    // Check if thread already exists
    const existingIndex = threads.findIndex(thread => thread.id === threadId);
    
    const threadInfo = {
      id: threadId,
      title: title || threadId,
      url,
      lastVisited: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      // Update existing thread
      threads[existingIndex] = {
        ...threads[existingIndex],
        ...threadInfo
      };
    } else {
      // Add new thread
      threads.push(threadInfo);
    }
    
    // Sort by last visited date (newest first)
    threads.sort((a, b) => new Date(b.lastVisited) - new Date(a.lastVisited));
    
    // Store back to localStorage
    localStorage.setItem('encrypted-app-thread-history', JSON.stringify(threads));
    return true;
  } catch (error) {
    console.error('Error saving thread to history:', error);
    return false;
  }
};

/**
 * Remove a thread from the history in localStorage
 * @param {string} threadId - The ID of the thread to remove
 * @returns {boolean} Success indicator
 */
export const removeThreadFromHistory = (threadId) => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const threads = getVisitedThreads();
    const filteredThreads = threads.filter(thread => thread.id !== threadId);
    
    if (filteredThreads.length === threads.length) {
      return false; // Thread not found
    }
    
    localStorage.setItem('encrypted-app-thread-history', JSON.stringify(filteredThreads));
    return true;
  } catch (error) {
    console.error('Error removing thread from history:', error);
    return false;
  }
};

/**
 * Get a recently shared thread URL from localStorage
 * @returns {string|null} The URL of the most recently shared thread or null
 */
export const getRecentlySharedThread = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    return localStorage.getItem('encrypted-app-recent-thread');
  } catch (error) {
    console.error('Error retrieving recently shared thread:', error);
    return null;
  }
};

/**
 * Save a recently shared thread URL to localStorage
 * @param {string} url - The URL of the thread (with encryption key)
 * @returns {boolean} Success indicator
 */
export const saveRecentlySharedThread = (url) => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    localStorage.setItem('encrypted-app-recent-thread', url);
    return true;
  } catch (error) {
    console.error('Error saving recently shared thread:', error);
    return false;
  }
};

/**
 * Clear the recently shared thread from localStorage
 * @returns {boolean} Success indicator
 */
export const clearRecentlySharedThread = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    localStorage.removeItem('encrypted-app-recent-thread');
    return true;
  } catch (error) {
    console.error('Error clearing recently shared thread:', error);
    return false;
  }
};