# SecureShare: End-to-End Encrypted Messaging Platform

A Next.js application implementing robust client-side end-to-end encryption with advanced PWA features for offline functionality. All encryption and decryption occur entirely in the browser, ensuring the server never has access to unencrypted content or encryption keys.

## Application Architecture

### Core Technology Stack

- **Frontend Framework**: Next.js with React and TypeScript
- **Styling**: Styled Components for theme-consistent UI
- **Encryption**: Web Crypto API for AES-GCM 128-bit encryption
- **Offline Support**: IndexedDB, Service Workers, next-pwa
- **State Management**: React Hooks and Context API
- **Storage**: File-based server storage with client-side IndexedDB for offline persistence

### Key Security Features

- 🔒 **True End-to-End Encryption**: AES-GCM 128-bit keys generated client-side
- 🔐 **Zero-Knowledge Design**: Server never sees or stores unencrypted data or keys
- 🔑 **URL Fragment Key Sharing**: Encryption keys transmitted via URL fragments, never sent to server
- 🧩 **Thread-Based Messaging**: Secure conversation threads with multiple encrypted messages
- 👤 **User-Specific Message Visibility**: Thread creators can see all messages, others only see their own
- 📲 **Offline Encryption**: Full ability to compose and encrypt messages offline
- 🔄 **Automatic Synchronization**: Queued messages auto-sent when connection restores

### Architectural Layers

#### 1. Client-Side Components

The application follows a strict separation of concerns using a container/presentational pattern:

- **Container Components**: Handle business logic, encryption/decryption, network operations
  - `EncryptionContainer.js`: Manages encryption workflow and offline message queueing
  - `DecryptionContainer.js`: Handles decryption, message display, and thread visibility rules

- **Presentational Components**: Handle pure UI rendering with no direct business logic
  - `EncryptForm.js`: UI for composing and encrypting messages
  - `DecryptDisplay.js`: UI for displaying decrypted messages and threads

#### 2. Core Services

- **Cryptography Service** (`lib/cryptoUtils.js`):
  - Wrapper around Web Crypto API for encryption operations
  - Manages key generation, encryption/decryption, and key import/export
  - Implements 128-bit AES-GCM encryption with proper IV handling

- **Storage Services**:
  - **Server Storage** (`lib/storage.js`): File-based storage for encrypted data
  - **IndexedDB Storage** (`lib/dbService.js`): Client-side database for offline operation
    - Stores queued messages when offline
    - Maintains encryption metadata for sync operations
    - Persists local user preferences and session data

- **Network Service** (`lib/networkService.js`):
  - Monitors online/offline status
  - Manages sync queue for offline messages
  - Implements retry logic and conflict resolution
  - Prevents duplicate message submissions

- **Thread Management** (`lib/thread.js`):
  - Handles organization of messages into conversation threads
  - Manages thread-specific permissions and visibility
  - Associates author identities with messages

#### 3. API Layer

- `pages/api/upload.js`: Receives and stores encrypted binary data
- `pages/api/download.js`: Retrieves encrypted data for client-side decryption

#### 4. PWA & Offline Features

- Service Worker (managed by next-pwa)
- Web App Manifest for installable experience
- IndexedDB for offline data persistence
- Offline detection and recovery logic
- Message queuing system for disconnected operation

### Data Flow Architecture

1. **Encryption Process**:
   - Key generation in browser using Web Crypto API
   - Content JSON serialization and encryption
   - Combination of IV (initialization vector) with ciphertext
   - Secure transmission to server as binary data

2. **Decryption Process**:
   - Encrypted data retrieval from server
   - Key extraction from URL fragment
   - IV extraction and ciphertext separation
   - Decryption using browser Web Crypto API
   - JSON parsing of decrypted content

3. **Offline Operation Flow**:
   - Network status detection and monitoring
   - Message encryption and local storage when offline
   - Automatic queue management and synchronization when online
   - User interface updates reflecting message status

### Data Storage Architecture

#### Server-Side Storage

The application uses a simple file-based storage system that could be replaced with a database:

- `.data/` - Root directory for all encrypted data
  - `.data/threads/` - Stores thread messages and metadata
    - `.data/threads/{threadId}/{index}.bin` - Encrypted message files
    - `.data/threads/{threadId}/{index}.meta.json` - Optional message metadata

#### Client-Side Storage

- **IndexedDB Stores**:
  - `message-queue`: Stores encrypted messages waiting to be sent
  - `local-cache`: Caches data for offline operation

### Security Implementation Details

- **Key Generation**: 128-bit AES-GCM keys generated using `crypto.subtle.generateKey()`
- **IV Handling**: Unique 12-byte IV generated for each encryption operation
- **Key Transport**: Keys shared only via URL fragments, never transmitted to server
- **Message Authentication**: GCM mode provides authenticated encryption
- **Metadata Isolation**: Author identification stored separately from encrypted content
- **Permissions Model**: Thread creators can view all messages, others only see their contributions

## Development Setup

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Production Deployment

```bash
# Build for production
npm run build

# Start the production server
npm start
```

## Key Files

- `lib/cryptoUtils.js` - Web Crypto API wrapper for encryption operations
- `lib/storage.js` - File-based storage for encrypted data
- `lib/dbService.js` - IndexedDB service for offline storage and sync
- `lib/networkService.js` - Network status monitoring and offline message queuing
- `lib/thread.js` - Thread management for conversations
- `components/containers/*` - Business logic containers
- `components/presentational/*` - UI components
- `pages/api/*` - Server API endpoints for data storage and retrieval
- `next.config.js` - Next.js configuration with PWA setup