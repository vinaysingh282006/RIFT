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

// Simple auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    console.log('Register request:', { email, firstName, lastName, role });
    
    // Check if user exists
    const existingUser = await mockDb.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create user
    const result = await mockDb.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role',
      [email, password, firstName, lastName, role || 'PATIENT']
    );
    
    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request:', { email });
    
    // Find user
    const result = await mockDb.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // In a real app, you'd verify the password hash
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await mockDb.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
    
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Analysis endpoints
app.post('/api/analysis/upload', async (req, res) => {
  try {
    const { userId, fileName, fileSize } = req.body;
    console.log('Analysis upload request:', { userId, fileName, fileSize });
    
    // Create analysis record
    const result = await mockDb.query(
      'INSERT INTO analyses (user_id, file_name, file_size, upload_path, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, fileName, fileSize, `/uploads/${fileName}`, 'PENDING']
    );
    
    res.status(201).json({
      message: 'Analysis uploaded successfully',
      analysis: result.rows[0]
    });
  } catch (error) {
    console.error('Analysis upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/analysis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Get analysis request:', { id });
    
    const result = await mockDb.query(
      'SELECT a.*, u.email, u.first_name, u.last_name FROM analyses a JOIN users u ON a.user_id = u.id WHERE a.id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to get analysis' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req, res) => {
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
      console.log('Available endpoints:');
      console.log('  GET  /health          - Health check');
      console.log('  GET  /test           - Test endpoint');
      console.log('  POST /api/auth/register - Register user');
      console.log('  POST /api/auth/login    - Login user');
      console.log('  POST /api/analysis/upload - Upload analysis');
      console.log('  GET  /api/analysis/:id   - Get analysis');
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