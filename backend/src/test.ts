import { logger } from './utils/logger';
import { connectDatabase } from './database/connection';
import { setupWebSocket } from './websocket/socket';

async function test() {
  logger.info('Testing imports...');
  try {
    await connectDatabase();
    logger.info('Database connection test passed');
  } catch (error) {
    logger.error('Database connection failed:', error);
  }
}

test();