import { logger } from './logger';
import { promises as fs } from 'fs';
import path from 'path';

// Cleanup old uploaded files that weren't properly deleted
export async function runCleanup() {
  try {
    const uploadsDir = path.join(__dirname, '../../../uploads');
    const files = await fs.readdir(uploadsDir);
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      
      // Delete files older than 24 hours
      if (Date.now() - stats.mtime.getTime() > 24 * 60 * 60 * 1000) {
        await fs.unlink(filePath);
        logger.info(`Cleaned up old file: ${filePath}`);
      }
    }
    
    logger.info('Cleanup completed');
  } catch (error) {
    logger.error('Error during cleanup:', error);
  }
}

// Schedule cleanup to run daily
export function startCleanupScheduler() {
  // Run cleanup once at startup
  runCleanup();
  
  // Then run every 24 hours
  setInterval(runCleanup, 24 * 60 * 60 * 1000);
  logger.info('Cleanup scheduler started');
}