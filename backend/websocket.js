const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'pharmaguard-dev-secret';

class WebSocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: [process.env.PATIENT_PORTAL_URL || 'http://localhost:5173', process.env.HOSPITAL_PORTAL_URL || 'http://localhost:5174'],
        methods: ['GET', 'POST']
      }
    });
    
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);
      
      // Handle authentication
      socket.on('authenticate', (data) => {
        try {
          const payload = jwt.verify(data.token, JWT_SECRET);
          socket.userId = payload.id;
          socket.userRole = payload.role;
          
          console.log(`User authenticated: ${payload.email} (${payload.role})`);
          
          // Join role-specific rooms
          socket.join(`role:${payload.role}`);
          
          // If it's a clinician, also join the clinicians room
          if (payload.role === 'CLINICIAN' || payload.role === 'ADMIN') {
            socket.join('clinicians');
          }
          
          // Join user-specific room
          socket.join(`user:${payload.id}`);
          
          socket.emit('authenticated', { success: true, userId: payload.id, role: payload.role });
        } catch (error) {
          console.error('WebSocket authentication failed:', error);
          socket.emit('authenticated', { success: false, error: 'Invalid token' });
        }
      });

      // Handle analysis events
      socket.on('analysis:start', (data) => {
        console.log(`Analysis started: ${data.analysisId} by user ${data.userId}`);
        
        // Broadcast to clinicians that a new analysis has started
        socket.to('clinicians').emit('analysis:created', {
          analysisId: data.analysisId,
          userId: data.userId,
          timestamp: new Date().toISOString()
        });
        
        // Log activity
        socket.to('clinicians').emit('activity:log', {
          userId: data.userId,
          action: 'ANALYSIS_STARTED',
          details: data,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('analysis:complete', (data) => {
        console.log(`Analysis completed: ${data.analysisId}`);
        
        // Broadcast results to the specific user and clinicians
        this.io.to(`user:${data.results.userId}`).emit('analysis:completed', data);
        socket.to('clinicians').emit('analysis:completed', data);
        
        // Log activity
        this.io.to('clinicians').emit('activity:log', {
          userId: data.results.userId,
          action: 'ANALYSIS_COMPLETED',
          details: {
            analysisId: data.analysisId,
            hasResults: !!data.results
          },
          timestamp: new Date().toISOString()
        });
      });

      socket.on('analysis:error', (data) => {
        console.error(`Analysis failed: ${data.analysisId} - ${data.error}`);
        
        // Broadcast error to relevant parties
        socket.to('clinicians').emit('analysis:error', data);
        
        // Log activity
        this.io.to('clinicians').emit('activity:log', {
          userId: data.userId,
          action: 'ANALYSIS_FAILED',
          details: data,
          timestamp: new Date().toISOString()
        });
      });

      // Handle activity logging
      socket.on('activity:log', (data) => {
        console.log(`Activity logged: ${data.userId} - ${data.action}`);
        
        // Broadcast to clinicians dashboard
        socket.to('clinicians').emit('activity:log', {
          ...data,
          timestamp: new Date().toISOString()
        });
      });

      // Handle user status updates
      socket.on('user:status', (data) => {
        console.log(`User status update: ${data.userId} - ${data.status}`);
        
        // Broadcast to clinicians
        socket.to('clinicians').emit('user:status', {
          ...data,
          timestamp: new Date().toISOString()
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        if (socket.userId) {
          socket.to('clinicians').emit('user:disconnected', {
            userId: socket.userId,
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    // Error handling
    this.io.engine.on('connection_error', (err) => {
      console.error('WebSocket connection error:', err);
    });
  }

  // Broadcast methods for server-side events
  broadcastAnalysisCreated(analysisId, userId) {
    this.io.to('clinicians').emit('analysis:created', {
      analysisId,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  broadcastAnalysisCompleted(analysisId, results) {
    this.io.to(`user:${results.userId}`).emit('analysis:completed', { analysisId, results });
    this.io.to('clinicians').emit('analysis:completed', { analysisId, results });
  }

  broadcastAnalysisError(analysisId, userId, error) {
    this.io.to('clinicians').emit('analysis:error', {
      analysisId,
      userId,
      error,
      timestamp: new Date().toISOString()
    });
  }

  broadcastActivity(userId, action, details) {
    this.io.to('clinicians').emit('activity:log', {
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = WebSocketService;