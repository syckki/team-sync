// This script handles offline functionality for the PWA

// Listen for online/offline events
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

// Check initial state
if (navigator.onLine === false) {
  handleOffline();
} else {
  handleOnline();
}

// Function to handle online status
function handleOnline() {
  console.log('App is online');
  document.body.classList.remove('offline-mode');
  document.body.classList.add('online-mode');
  
  // Try to sync any queued messages
  if (window.syncQueuedMessages) {
    window.syncQueuedMessages();
  }
  
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('app-online'));
}

// Function to handle offline status
function handleOffline() {
  console.log('App is offline');
  document.body.classList.remove('online-mode');
  document.body.classList.add('offline-mode');
  
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('app-offline'));
  
  // Show offline notification if not on offline page
  if (!window.location.pathname.includes('_offline')) {
    showOfflineNotification();
  }
}

// Show a notification that we're offline
function showOfflineNotification() {
  // Check if notification already exists
  if (document.getElementById('offline-notification')) {
    return;
  }
  
  const notification = document.createElement('div');
  notification.id = 'offline-notification';
  notification.innerHTML = `
    <div class="offline-icon">📶</div>
    <div class="offline-message">
      <strong>You're offline</strong>
      <span>Don't worry! You can still use the app and your changes will sync when you're back online.</span>
    </div>
    <button class="close-btn">✕</button>
  `;
  
  // Style the notification
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.maxWidth = '300px';
  notification.style.backgroundColor = '#f8f9fa';
  notification.style.border = '1px solid #dee2e6';
  notification.style.borderLeft = '4px solid #dc3545';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  notification.style.padding = '15px';
  notification.style.zIndex = '9999';
  notification.style.display = 'flex';
  notification.style.alignItems = 'flex-start';
  notification.style.gap = '10px';
  
  // Add to body
  document.body.appendChild(notification);
  
  // Handle close button
  const closeBtn = notification.querySelector('.close-btn');
  closeBtn.style.background = 'transparent';
  closeBtn.style.border = 'none';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontSize = '16px';
  closeBtn.style.marginLeft = 'auto';
  
  closeBtn.addEventListener('click', () => {
    notification.remove();
  });
  
  // Auto-hide after 8 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 8000);
}

// Expose utility functions for app use
window.isAppOnline = () => navigator.onLine !== false;
window.showOfflineNotification = showOfflineNotification;

// Make sure the IndexedDB is accessible offline
if ('indexedDB' in window) {
  // Open the database to ensure it's in the browser's cache
  const request = indexedDB.open('encrypted-messages-db', 1);
  request.onerror = (event) => {
    console.error('Error opening IndexedDB for offline caching', event);
  };
}