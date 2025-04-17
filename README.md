# Secure End-to-End Encrypted Messaging

A Next.js application that implements client-side end-to-end encryption using the Web Crypto API. All encryption and decryption happen in the browser, ensuring the server never has access to unencrypted content or encryption keys.

## Features

- 🔒 End-to-end encryption using AES-GCM 128-bit keys
- 🧵 Threaded conversations with multiple encrypted messages
- 🔑 URL fragment-based key sharing (never sent to the server)
- 📱 Responsive design for mobile and desktop
- 🏗️ Container/Presentational component architecture
- 📦 Static site generation with Next.js

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
- **Lib utilities** - Core functionality for encryption, storage, and threading

### Key Files

- `lib/cryptoUtils.js` - Web Crypto API wrapper for encryption operations
- `lib/storage.js` - File-based storage for encrypted data
- `lib/thread.js` - Thread management for conversations
- `lib/migration.js` - Migrates legacy files to thread system
- `components/containers/*` - Business logic containers
- `components/presentational/*` - UI components
- `pages/api/*` - Server API endpoints for data storage and retrieval

## Security Notes

- All encryption/decryption happens client-side using the Web Crypto API
- Encryption keys are never sent to the server, only shared via URL fragments
- The server only stores encrypted binary data
- Files are automatically cleaned up after 24 hours

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```