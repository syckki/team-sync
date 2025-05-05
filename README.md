# AI Productivity Tracker with End-to-End Encryption

A Next.js Progressive Web Application (PWA) that provides intelligent productivity enhancement and secure communication with advanced responsive design and adaptive encryption capabilities. The application features end-to-end encrypted messaging and AI productivity reporting, offering a comprehensive solution for secure collaboration.

## Features

- 🔒 End-to-end encryption using AES-GCM 128-bit keys
- 🧵 Threaded conversations with multiple encrypted messages
- 🔑 URL fragment-based key sharing (never sent to the server)
- 📱 Mobile-first responsive design with dynamic breakpoint management
- 🏗️ Container/Presentational component architecture
- 📦 Static site generation with Next.js for optimal performance
- 📊 AI productivity reporting with comprehensive form components
- 🔄 Progressive Web App (PWA) capabilities with offline support
- 📝 Draft saving functionality for productivity reports
- 💬 Secure message composition and sharing

## Data Storage

The application uses a simple file-based storage system for development:

- `.data/` - Root directory for all encrypted data
  - `.data/threads/` - Stores thread messages and metadata
    - `.data/threads/{threadId}/{index}.bin` - Encrypted message files
    - `.data/threads/{threadId}/{index}.meta.json` - Optional message metadata

In a production environment, this would be replaced with a proper database.

## Architecture

The application follows a strict separation of concerns:

- **Container Components** - Handle business logic, encryption/decryption, and API calls
- **Presentational Components** - Handle UI rendering with no direct knowledge of business logic
- **Lib utilities** - Core functionality for encryption, storage, threading, and offline support
- **Responsive design system** - Centralized breakpoint management for consistent device support

### Key Files

- `lib/cryptoUtils.js` - Web Crypto API wrapper for encryption operations
- `lib/storage.js` - File-based storage for encrypted data
- `lib/thread.js` - Thread management for encrypted conversations
- `lib/dbService.js` - IndexedDB service for offline storage and message queueing
- `lib/networkService.js` - Network monitoring and offline/online synchronization
- `lib/styles.js` - Shared style constants for responsive design
- `components/containers/EncryptionContainer.js` - Handles thread creation and encryption
- `components/containers/DecryptionContainer.js` - Handles thread decryption and viewing
- `components/containers/ReportFormContainer.js` - AI productivity report form logic
- `components/presentational/ReportForm.js` - AI productivity report UI
- `components/presentational/EncryptForm.js` - Thread creation UI
- `components/presentational/ResponsiveTable.js` - Mobile-responsive table component
- `components/presentational/CreatableComboBox.js` - Custom dropdown with creation capability
- `components/presentational/Header.js` - Application header with responsive navigation
- `pages/index.js` - Thread creation page
- `pages/view/[id]/index.js` - Thread inbox view
- `pages/view/[id]/report.js` - AI productivity reporting
- `pages/api/*` - Server API endpoints for data storage and retrieval
- `pages/_offline.js` - Offline fallback page for PWA

## Security Notes

- All encryption/decryption happens client-side using the Web Crypto API
- Encryption keys are never sent to the server, only shared via URL fragments
- The server only stores encrypted binary data
- Files are automatically cleaned up after 24 hours

## Technology Stack

- **Frontend Framework**: Next.js with React
- **Styling**: Styled-components for component-based styling
- **PWA Support**: @ducanh2912/next-pwa for Progressive Web App features
- **Encryption**: Web Crypto API for client-side encryption (AES-GCM 128-bit)
- **Offline Support**: IndexedDB for local storage and message queueing
- **Deployment**: Static site generation with dynamic paths

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will be available at http://localhost:5000 by default.

## User Interface Design

- **Mobile-first approach**: All components designed with mobile as the primary target
- **Responsive breakpoints**: Centralized in the Breakpoint enum in `lib/styles.js`
- **Component customization**: Form inputs use custom components for better UX and mobile support
- **Adaptive layout**: Header layout shifts from column on mobile to row on desktop
- **Performance optimizations**: Static generation with client-side encryption reduces server load

## PWA Features

- Offline support with service worker
- Message queueing when offline
- Automatic synchronization on reconnection
- Installable to home screen
- Responsive design for all device sizes

## Application Flow

1. **Thread Creation**:
   - User navigates to the "Create New Thread" page
   - Enters thread title and initial message
   - Client-side encryption generates AES-GCM 128-bit key
   - Data is encrypted and sent to server
   - User receives a shareable link with the encryption key in the URL fragment

2. **Thread Viewing**:
   - User opens thread link with key in URL fragment
   - System retrieves encrypted data from the server
   - Client decrypts the data using the key from the URL
   - Threaded messages are displayed in the Inbox view
   - User can add new messages, all encrypted with the same key

3. **AI Productivity Reporting**:
   - User can access the AI Productivity Report form from thread view
   - Form allows tracking of AI tool usage and productivity gains
   - Reports support draft saving for later completion
   - Submitted reports are encrypted and stored like other messages

4. **Offline Support**:
   - When offline, messages are stored in IndexedDB
   - System shows offline indicator and queued message status
   - Messages sync automatically when connection is restored
   - PWA caching enables viewing existing content when offline