import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

interface UserSocket extends Socket {
  userId?: string;
  role?: string;
}

export function setupWebSocket(io: Server) {
  io.on('connection', (socket: UserSocket) => {
    logger.info(`User connected: ${socket.id}`);
    
    // Handle user authentication
    socket.on('authenticate', (data: { userId: string; role: string }) => {
      socket.userId = data.userId;
      socket.role = data.role;
      logger.info(`User authenticated: ${data.userId} (${data.role})`);
      
      // Join role-specific rooms
      socket.join(`role:${data.role}`);
      
      // If it's a clinician, also join the clinicians room
      if (data.role === 'clinician') {
        socket.join('clinicians');
      }
      
      socket.emit('authenticated', { success: true });
    });

    // Handle analysis events
    socket.on('analysis:start', (data: { analysisId: string; userId: string }) => {
      logger.info(`Analysis started: ${data.analysisId} by user ${data.userId}`);
      // Broadcast to clinicians that a new analysis has started
      socket.to('clinicians').emit('analysis:created', {
        analysisId: data.analysisId,
        userId: data.userId,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('analysis:complete', (data: { analysisId: string; results: any }) => {
      logger.info(`Analysis completed: ${data.analysisId}`);
      // Broadcast results to the specific user and clinicians
      io.to(`user:${data.results.userId}`).emit('analysis:completed', data);
      socket.to('clinicians').emit('analysis:completed', data);
    });

    socket.on('analysis:error', (data: { analysisId: string; error: string }) => {
      logger.error(`Analysis failed: ${data.analysisId} - ${data.error}`);
      // Broadcast error to relevant parties
      socket.to('clinicians').emit('analysis:error', data);
    });

    // Handle activity logging
    socket.on('activity:log', (data: { userId: string; action: string; details: any }) => {
      logger.info(`Activity logged: ${data.userId} - ${data.action}`);
      // Broadcast to clinicians dashboard
      socket.to('clinicians').emit('activity:log', {
        ...data,
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
      if (socket.userId) {
        socket.to('clinicians').emit('user:disconnected', {
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  // Error handling
  io.engine.on('connection_error', (err) => {
    logger.error('WebSocket connection error:', err);
  });
}