/**
 * Global dropdown state management
 * Used to ensure all dropdowns close when clicking on disabled fields
 * or when certain global events occur
 */

// Event name for custom dropdown close event
export const CLOSE_ALL_DROPDOWNS_EVENT = 'closeAllDropdowns';

/**
 * Initialize global dropdown event listeners
 * This should be called once during application startup
 */
export const initDropdownManager = () => {
  if (typeof window === 'undefined') return; // Skip on server-side
  
  // Already initialized
  if (window._dropdownManagerInitialized) return;
  
  // Create a custom event for closing all dropdowns
  const closeAllDropdownsEvent = new CustomEvent(CLOSE_ALL_DROPDOWNS_EVENT);
  
  // Event handler to close all dropdowns when clicking on disabled elements
  const handleDisabledElementClick = (event) => {
    if (event.target.disabled || event.target.getAttribute('aria-disabled') === 'true') {
      window.dispatchEvent(closeAllDropdownsEvent);
    }
  };
  
  // Listen for clicks on disabled elements
  document.addEventListener('mousedown', handleDisabledElementClick);
  
  // Mark as initialized to prevent duplicate event listeners
  window._dropdownManagerInitialized = true;
  
  // Cleanup function (for hot module reloading)
  return () => {
    document.removeEventListener('mousedown', handleDisabledElementClick);
    window._dropdownManagerInitialized = false;
  };
};

/**
 * Register a listener for the close all dropdowns event
 * @param {Function} callback - Function to call when all dropdowns should close
 * @returns {Function} Cleanup function to remove the listener
 */
export const registerDropdownCloseListener = (callback) => {
  if (typeof window === 'undefined') return () => {}; // No-op on server
  
  const handler = () => callback();
  window.addEventListener(CLOSE_ALL_DROPDOWNS_EVENT, handler);
  
  return () => {
    window.removeEventListener(CLOSE_ALL_DROPDOWNS_EVENT, handler);
  };
};