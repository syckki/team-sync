# Architecture Overview

## 1. Overview

This repository contains a Secure AI Productivity Tracker, a Next.js Progressive Web Application (PWA) with end-to-end encryption. The application is designed for securely tracking AI productivity metrics and facilitating team collaboration while maintaining strict privacy through client-side encryption.

The application follows a modern web architecture with a focus on:
- Security (end-to-end encryption)
- Offline capabilities (PWA features)
- Responsive design
- Component-based architecture

## 2. System Architecture

The application follows a client-centric architecture where most of the processing, including encryption and decryption, happens on the client side. The server primarily serves the application and handles the storage of encrypted data without the ability to read the actual content.

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Client (Browser)                        │
│                                                            │
│  ┌──────────────┐    ┌────────────┐    ┌───────────────┐   │
│  │  Next.js App │    │ Web Crypto │    │   IndexedDB   │   │
│  │   (React)    │◄───┤     API    │◄───┤ (Offline Data)│   │
│  └──────┬───────┘    └────────────┘    └───────────────┘   │
│         │                                                   │
└─────────┼───────────────────────────────────────────────────┘
          │
          │ HTTPS (Encrypted Data Only)
          ▼
┌─────────────────────┐
│      Next.js        │
│   Server (API)      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   File-based        │
│   Storage           │
└─────────────────────┘
```

### Key Architectural Characteristics

1. **Client-Side Encryption**: All sensitive data is encrypted and decrypted in the browser using the Web Crypto API before being sent to the server.

2. **Progressive Web App**: The application functions as a PWA, enabling offline capabilities and installation on devices.

3. **Single Page Application**: The frontend is built as an SPA using Next.js and React, providing a smooth user experience.

4. **File-Based Storage**: For simplicity, the current implementation uses file-based storage on the server side, which would be replaced with a proper database in production.

## 3. Key Components

### Frontend Components

The frontend is organized using the Model-View-ViewModel (MVVM) pattern:

1. **ViewModels**: Handle business logic, state management, and data preparation
   - `EncryptionViewModel`: Manages encryption processes
   - `DecryptionViewModel`: Manages decryption processes
   - `ReportFormViewModel`: Handles form submission logic
   - Report-specific ViewModels for different types of analyses

2. **Presentational Components**: Responsible for rendering UI elements
   - `Layout`: Overall page layout
   - `Header`: Application header
   - `EncryptForm`: Form for encrypting messages
   - `ReportForm`: Form for submitting productivity reports
   - `ResponsiveTable`: Reusable table component
   - `CustomSelect`, `CreatableComboBox`: Form components
   - Report visualization components

3. **Utility Libraries**:
   - `cryptoUtils.js`: Encryption/decryption functions
   - `dbService.js`: IndexedDB interface for local storage
   - `networkService.js`: Network status monitoring and synchronization
   - `styles.js`: Shared styling utilities

### Backend Components

The backend is minimal, focusing primarily on serving the frontend and storing encrypted data:

1. **API Routes**:
   - `/api/upload`: Receives and stores encrypted data
   - `/api/download`: Retrieves encrypted data
   - `/api/reports`: Specifically for storing encrypted productivity reports

2. **Storage**:
   - `lib/storage.js`: File-based storage implementation
   - `lib/thread.js`: Manages "threads" of messages and reports

### Styling Approach

The application uses Styled Components for CSS-in-JS styling, with:
- A theme system defined in `styles/theme.js`
- Global styles in `styles/globalStyles.js`
- Component-specific styles defined alongside their components

## 4. Data Flow

### End-to-End Encryption Flow

1. **Creating Encrypted Content**:
   - User inputs data through forms
   - Data is encrypted in the browser using Web Crypto API
   - Encrypted data is sent to the server via API routes
   - Server stores encrypted data without the ability to decrypt it
   - A unique URL with a key fragment (for decryption) is generated

2. **Retrieving Encrypted Content**:
   - User accesses a URL containing a key fragment
   - Application fetches encrypted data from the server
   - Browser decrypts the data using the key fragment from the URL
   - Decrypted content is displayed to the user

### Offline Capability Flow

1. **When Online**:
   - Data is immediately sent to the server
   - Local storage (IndexedDB) caches responses

2. **When Offline**:
   - User can still input data
   - Data is stored in IndexedDB queue
   - When connection is restored, queued data is automatically sent to the server

### Productivity Reports Flow

1. **Submitting Reports**:
   - Team members fill out productivity reports about AI tool usage
   - Reports are encrypted and stored on the server
   - Reports can be drafted and updated before final submission

2. **Analyzing Reports**:
   - Reports are decrypted on the client side
   - Various analyses are performed in the browser
   - Results are displayed through specialized visualization components

## 5. External Dependencies

### Core Dependencies

- **Next.js**: React framework for server-rendered applications
- **React**: Frontend UI library
- **styled-components**: CSS-in-JS styling solution
- **@ducanh2912/next-pwa**: PWA integration for Next.js

### Browser APIs

- **Web Crypto API**: For client-side encryption/decryption
- **IndexedDB**: For offline storage and synchronization
- **Service Workers**: For PWA capabilities

### Development and Build Tools

- **Node.js**: JavaScript runtime
- **npm**: Package manager

## 6. Deployment Strategy

The application is configured to deploy on various platforms:

1. **Development Environment**:
   - Uses `next dev` command
   - Port 5000 for local development
   - Configured for Replit development environment

2. **Production Deployment**:
   - The application can be deployed as a standard Next.js application
   - PWA capabilities enabled in production
   - Content Security Policy headers configured for security

3. **Security Considerations**:
   - CSP headers to prevent XSS attacks
   - X-Content-Type-Options and X-XSS-Protection headers
   - HTTPS recommended for production deployment

### Current Deployment Config

The application is currently configured to run in a Replit environment with specific configurations in `.replit` and `replit.nix` files. The actual production deployment would likely use a different setup depending on the hosting provider.

## 7. Security Architecture

Security is a primary focus of this application with the following key features:

1. **End-to-End Encryption**:
   - All sensitive data is encrypted before leaving the browser
   - AES-GCM 128-bit encryption via Web Crypto API
   - Encryption keys never sent to the server

2. **Content Security Policy**:
   - Strict CSP headers to prevent XSS attacks
   - Default-src restricted to 'self'
   - Limited exceptions for fonts and styling

3. **Secure Headers**:
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block

4. **URL-Based Key Distribution**:
   - Decryption keys are shared via URL fragments (hash)
   - Hash fragments are not sent to the server in HTTP requests

5. **No Server-Side Authentication**:
   - Security model doesn't rely on traditional authentication
   - Access control is enforced through possession of encryption keys