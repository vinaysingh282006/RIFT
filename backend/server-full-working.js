const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createServer } = require('http');
const WebSocketService = require('./websocket');

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize WebSocket service
const websocketService = new WebSocketService(server);

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'pharmaguard-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

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
        password: params[1],
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
    
    if (text.includes('SELECT * FROM users WHERE id') && params) {
      const user = mockDb.users.find(u => u.id === params[0]);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    
    if (text.includes('INSERT INTO analyses') && params) {
      const analysis = {
        id: `analysis_${Date.now()}`,
        user_id: params[0],
        file_name: params[1],
        file_size: params[2],
        upload_path: params[3],
        status: params[4],
        started_at: new Date().toISOString()
      };
      mockDb.analyses.push(analysis);
      return { rows: [analysis], rowCount: 1 };
    }
    
    if (text.includes('SELECT a.*, u.email') && params) {
      const analysis = mockDb.analyses.find(a => a.id === params[0]);
      if (analysis) {
        const user = mockDb.users.find(u => u.id === analysis.user_id);
        return { 
          rows: [{
            ...analysis,
            email: user ? user.email : null,
            first_name: user ? user.first_name : null,
            last_name: user ? user.last_name : null
          }], 
          rowCount: 1 
        };
      }
      return { rows: [], rowCount: 0 };
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

// Authentication middleware
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

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

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await mockDb.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await mockDb.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role',
      [email, hashedPassword, firstName, lastName, role || 'PATIENT']
    );

    // Generate tokens
    const user = result.rows[0];
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      tokens: { accessToken }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const result = await mockDb.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      tokens: { accessToken }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await mockDb.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Analysis endpoints
app.post('/api/analysis/upload', authenticateToken, async (req, res) => {
  try {
    const { fileName, fileSize } = req.body;
    const userId = req.user.id;

    if (!fileName || !fileSize) {
      return res.status(400).json({ error: 'File name and size required' });
    }

    // Create analysis record
    const result = await mockDb.query(
      'INSERT INTO analyses (user_id, file_name, file_size, upload_path, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, fileName, fileSize, `/uploads/${fileName}`, 'PENDING']
    );

    const analysis = result.rows[0];

    console.log(`Analysis started: ${analysis.id} for user ${userId}`);

    res.status(201).json({
      message: 'Analysis uploaded successfully',
      analysis: {
        id: analysis.id,
        fileName: analysis.file_name,
        fileSize: analysis.file_size,
        status: analysis.status,
        startedAt: analysis.started_at
      }
    });
  } catch (error) {
    console.error('Analysis upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/analysis/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await mockDb.query(
      'SELECT a.*, u.email, u.first_name, u.last_name FROM analyses a JOIN users u ON a.user_id = u.id WHERE a.id = $1',
      [id]
    );
    
    const analysis = result.rows[0];
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Check permissions
    if (analysis.user_id !== userId && req.user.role !== 'CLINICIAN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to get analysis' });
  }
});

app.get('/api/analysis', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let analyses;

    if (req.user.role === 'CLINICIAN' || req.user.role === 'ADMIN') {
      // Clinicians can see all analyses
      analyses = mockDb.analyses;
    } else {
      // Regular users can only see their own analyses
      analyses = mockDb.analyses.filter(a => a.user_id === userId);
    }

    res.status(200).json({
      analyses,
      count: analyses.length
    });
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({ error: 'Failed to get analyses' });
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
    server.listen(PORT, () => {
      console.log(`🚀 PharmaGuard Backend Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('Available endpoints:');
      console.log('  GET  /health          - Health check');
      console.log('  GET  /test           - Test endpoint');
      console.log('  POST /api/auth/register - Register user');
      console.log('  POST /api/auth/login    - Login user');
      console.log('  GET  /api/auth/me       - Get user profile');
      console.log('  POST /api/analysis/upload - Upload analysis');
      console.log('  GET  /api/analysis/:id   - Get analysis');
      console.log('  GET  /api/analysis       - Get all analyses');
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