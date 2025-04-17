/**
 * Migration script to move existing encrypted files into the thread system
 */
import fs from 'fs';
import path from 'path';
import { addMessageToThread } from './thread';

export const migrateFilesToThreads = async () => {
  const dataDir = path.join(process.cwd(), '.data');
  
  if (!fs.existsSync(dataDir)) {
    console.log('No data directory found, nothing to migrate');
    return { migrated: 0 };
  }
  
  // Get all .bin files in the root data directory
  const files = fs.readdirSync(dataDir)
    .filter(file => file.endsWith('.bin') && !file.includes('/'));
  
  if (files.length === 0) {
    console.log('No files to migrate');
    return { migrated: 0 };
  }
  
  console.log(`Found ${files.length} files to migrate to thread system`);
  
  let migratedCount = 0;
  
  for (const file of files) {
    try {
      // Get file path and ID (filename without extension)
      const filePath = path.join(dataDir, file);
      const id = file.replace('.bin', '');
      
      // Read the file
      const data = fs.readFileSync(filePath);
      
      // Create a thread with the same ID as the file
      const threadInfo = await addMessageToThread(id, data);
      
      console.log(`Migrated file ${file} to thread ${threadInfo.threadId}`);
      migratedCount++;
    } catch (error) {
      console.error(`Error migrating file ${file}:`, error);
    }
  }
  
  return { migrated: migratedCount };
};