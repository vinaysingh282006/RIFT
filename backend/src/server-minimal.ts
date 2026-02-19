import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { connectDatabase, initializeDatabase } from './database/connection';
import { authRouter } from './auth/routes';
import { analysisRouter } from './api/analysis';
import { patientRouter } from './api/patients';
import { reportRouter } from './api/reports';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.PATIENT_PORTAL_URL || 'http://localhost:5173', process.env.HOSPITAL_PORTAL_URL || 'http://localhost:5174'],
  credentials: true
}));
app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/patients', patientRouter);
app.use('/api/reports', reportRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    console.log('Starting server initialization...');
    logger.info('Starting server initialization...');
    
    // Connect to database
    await connectDatabase();
    console.log('Database connected successfully');
    logger.info('Database connected successfully');
    
    // Initialize database tables
    await initializeDatabase();
    console.log('Database tables initialized');
    logger.info('Database tables initialized successfully');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 PharmaGuard Backend Server running on port ${PORT}`);
      logger.info(`🚀 PharmaGuard Backend Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('Server started successfully. Press Ctrl+C to stop.');
      logger.info('Server started successfully. Press Ctrl+C to stop.');
    });

    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('Received SIGINT. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();