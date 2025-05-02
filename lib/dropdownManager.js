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

// Initialize global document click handler only once
if (typeof window !== 'undefined') {
  document.addEventListener('mousedown', (event) => {
    // If the click wasn't on a dropdown itself, close all dropdowns
    // Each dropdown component will need to stop propagation on its own clicks
    // to prevent this handler from closing it
    closeAllDropdowns();
  });
}