import { Pool } from 'pg';
import { logger } from '../utils/logger';

// Mock database for development when PostgreSQL is not available
class MockDatabase {
  private data: any = {
    users: [],
    analyses: [],
    activityLogs: []
  };

  async query(text: string, params?: any[]) {
    logger.debug('Mock query:', text, params);
    
    // Simple query parsing for mock database
    if (text.includes('CREATE TABLE')) {
      logger.info('Mock table created');
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
      this.data.users.push(user);
      return { rows: [user], rowCount: 1 };
    }
    
    if (text.includes('SELECT * FROM users WHERE email') && params) {
      const user = this.data.users.find((u: any) => u.email === params[0]);
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
      this.data.analyses.push(analysis);
      return { rows: [analysis], rowCount: 1 };
    }
    
    if (text.includes('SELECT a.*, u.email')) {
      if (text.includes('WHERE a.id =') && params) {
        const analysis = this.data.analyses.find((a: any) => a.id === params[0]);
        return { rows: analysis ? [analysis] : [], rowCount: analysis ? 1 : 0 };
      }
      return { rows: this.data.analyses.slice(0, 10), rowCount: this.data.analyses.length };
    }
    
    return { rows: [], rowCount: 0 };
  }

  async connect() {
    logger.info('Mock database connected');
    return this;
  }

  async end() {
    logger.info('Mock database connection closed');
  }
}

// Use mock database for development
const useMockDatabase = !process.env.DATABASE_URL || process.env.NODE_ENV === 'development';

let databaseInstance: any;

if (useMockDatabase) {
  logger.info('Using mock database for development');
  databaseInstance = new MockDatabase();
} else {
  logger.info('Using PostgreSQL database');
  databaseInstance = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

// Database connection
export async function connectDatabase() {
  try {
    await databaseInstance.connect();
    logger.info('Database connected successfully');
    return databaseInstance;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    await databaseInstance.end();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Failed to disconnect from database:', error);
    throw error;
  }
}

// Database query helpers
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await databaseInstance.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Query error', { text, error });
    throw error;
  }
}

// Database models
export const db = {
  // User operations
  user: {
    create: async (data: { email: string; password: string; firstName: string; lastName: string; role: string }) => {
      const result = await query(
        `INSERT INTO users (email, password, first_name, last_name, role) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role, created_at`,
        [data.email, data.password, data.firstName, data.lastName, data.role]
      );
      return result.rows[0];
    },
    
    findByEmail: async (email: string) => {
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    },
    
    findById: async (id: string) => {
      const result = await query(
        'SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    },
    
    updateLastLogin: async (id: string) => {
      await query(
        'UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1',
        [id]
      );
    }
  },
  
  // Analysis operations
  analysis: {
    create: async (data: { userId: string; fileName: string; fileSize: number; uploadPath: string }) => {
      const result = await query(
        `INSERT INTO analyses (user_id, file_name, file_size, upload_path, status) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [data.userId, data.fileName, data.fileSize, data.uploadPath, 'PENDING']
      );
      return result.rows[0];
    },
    
    findById: async (id: string) => {
      const result = await query(
        `SELECT a.*, u.email, u.first_name, u.last_name 
         FROM analyses a 
         JOIN users u ON a.user_id = u.id 
         WHERE a.id = $1`,
        [id]
      );
      return result.rows[0];
    },
    
    findByUserId: async (userId: string) => {
      const result = await query(
        `SELECT a.*, u.email, u.first_name, u.last_name 
         FROM analyses a 
         JOIN users u ON a.user_id = u.id 
         WHERE a.user_id = $1 
         ORDER BY a.started_at DESC`,
        [userId]
      );
      return result.rows;
    },
    
    updateStatus: async (id: string, status: string, results?: any, error?: string) => {
      const result = await query(
        `UPDATE analyses 
         SET status = $1, results = $2, error = $3, completed_at = NOW(), processing_time = EXTRACT(EPOCH FROM (NOW() - started_at))
         WHERE id = $4 
         RETURNING *`,
        [status, results ? JSON.stringify(results) : null, error || null, id]
      );
      return result.rows[0];
    },
    
    findAll: async (limit: number = 50, offset: number = 0) => {
      const result = await query(
        `SELECT a.*, u.email, u.first_name, u.last_name 
         FROM analyses a 
         JOIN users u ON a.user_id = u.id 
         ORDER BY a.started_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    }
  },
  
  // Activity log operations
  activityLog: {
    create: async (data: { userId: string; analysisId?: string; action: string; details?: any }) => {
      const result = await query(
        `INSERT INTO activity_logs (user_id, analysis_id, action, details) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [data.userId, data.analysisId || null, data.action, data.details ? JSON.stringify(data.details) : null]
      );
      return result.rows[0];
    },
    
    findByUserId: async (userId: string, limit: number = 50) => {
      const result = await query(
        `SELECT al.*, u.email, u.first_name, u.last_name, a.file_name
         FROM activity_logs al
         JOIN users u ON al.user_id = u.id
         LEFT JOIN analyses a ON al.analysis_id = a.id
         WHERE al.user_id = $1
         ORDER BY al.timestamp DESC
         LIMIT $2`,
        [userId, limit]
      );
      return result.rows;
    },
    
    findAll: async (limit: number = 100) => {
      const result = await query(
        `SELECT al.*, u.email, u.first_name, u.last_name, a.file_name
         FROM activity_logs al
         JOIN users u ON al.user_id = u.id
         LEFT JOIN analyses a ON al.analysis_id = a.id
         ORDER BY al.timestamp DESC
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    }
  }
};

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'PATIENT' CHECK (role IN ('PATIENT', 'CLINICIAN', 'ADMIN')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_login_at TIMESTAMP
      )
    `);
    
    // Create analyses table
    await query(`
      CREATE TABLE IF NOT EXISTS analyses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_size INTEGER NOT NULL,
        upload_path VARCHAR(500) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')),
        results JSONB,
        error TEXT,
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        processing_time INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create activity_logs table
    await query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        details JSONB,
        timestamp TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await query('CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_analyses_started_at ON analyses(started_at)');
    await query('CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp)');
    
    logger.info('Database tables initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}