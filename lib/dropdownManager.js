/**
 * Dropdown Manager - Utility for managing dropdowns across components
 * This helps coordinate dropdown UI elements to ensure only one is open at a time
 * and that they all close when clicks happen outside their containers
 */

// Active dropdown registry (Set of callback functions to close dropdowns)
const activeDropdowns = new Set();

/**
 * Register a dropdown with the manager
 * @param {Function} closeDropdownFn - Function to close the dropdown
 * @returns {Function} - Unregister function
 */
export const registerDropdown = (closeDropdownFn) => {
  // Add to the active dropdowns set
  activeDropdowns.add(closeDropdownFn);
  
  // Return function to unregister
  return () => {
    activeDropdowns.delete(closeDropdownFn);
  };
};

/**
 * Close all dropdowns except the excluded one
 * @param {Function} excludeDropdownFn - Optional dropdown to exclude from closing
 */
export const closeAllDropdowns = (excludeDropdownFn = null) => {
  activeDropdowns.forEach((closeDropdownFn) => {
    // Skip the excluded dropdown
    if (closeDropdownFn !== excludeDropdownFn) {
      closeDropdownFn();
    }
  });
};

// More advanced click tracking to ensure dropdowns close properly
let globalClickHandled = false;

// Initialize global document click handler only once
if (typeof window !== 'undefined') {
  // Use capture phase to ensure this runs before component handlers
  document.addEventListener('mousedown', (event) => {
    // Mark that we've handled a global click
    globalClickHandled = true;
    
    // Immediately force close all dropdowns on any click
    // Components will reopen their dropdowns if needed via stopPropagation
    closeAllDropdowns();
  }, true); // Use capture phase
  
  // Also handle click events on the document body for clicks on disabled elements
  document.body.addEventListener('click', (event) => {
    // If the click is on a disabled element (which won't trigger normal events)
    if (event.target.disabled || 
        event.target.getAttribute('aria-disabled') === 'true' ||
        event.target.closest('[disabled], [aria-disabled="true"]')) {
      closeAllDropdowns();
    }
  }, true);
  
  // Reset the click handled flag for the next event cycle
  document.addEventListener('mouseup', () => {
    setTimeout(() => {
      globalClickHandled = false;
    }, 10);
  });
}