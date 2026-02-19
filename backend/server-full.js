const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Mock database
const mockDb = {
  users: [],
  analyses: [],
  activityLogs: [],
  
  query: async (text, params) => {
    console.log('DB Query:', text, params);
    
    if (text.includes('CREATE TABLE')) {
      return { rows: [], rowCount: 0 };
    }
    
    if (text.includes('INSERT INTO users') && params) {
      const user = {
        id: `user_${Date.now()}`,
        email: params[0],
        first_name: params[2],
        last_name: params[3],
        role: params[4],
        created_at: new Date().toISOString()
      };
      mockDb.users.push(user);
      return { rows: [user], rowCount: 1 };
    }
    
    if (text.includes('SELECT * FROM users WHERE email') && params) {
      const user = mockDb.users.find(u => u.email === params[0]);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    
    return { rows: [], rowCount: 0 };
  }
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.PATIENT_PORTAL_URL || 'http://localhost:5173', process.env.HOSPITAL_PORTAL_URL || 'http://localhost:5174'],
  credentials: true
}));
app.use(morgan('combined'));
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

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

// API Routes
app.use('/api/auth', require('./dist/auth/routes'));
app.use('/api/analysis', require('./dist/api/analysis'));
app.use('/api/patients', require('./dist/api/patients'));
app.use('/api/reports', require('./dist/api/reports'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create tables
    await mockDb.query('CREATE TABLE IF NOT EXISTS users (...)');
    await mockDb.query('CREATE TABLE IF NOT EXISTS analyses (...)');
    await mockDb.query('CREATE TABLE IF NOT EXISTS activity_logs (...)');
    
    console.log('Database tables created');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Start server
async function startServer() {
  try {
    console.log('Starting server initialization...');
    
    // Initialize database
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 PharmaGuard Backend Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('Server started successfully. Press Ctrl+C to stop.');
    });
    
    // Keep process alive and handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('Received SIGINT. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });
    
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();