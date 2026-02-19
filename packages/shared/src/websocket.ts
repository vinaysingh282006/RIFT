import { io, Socket } from 'socket.io-client';
import { AuthManager } from './auth';
import { WebSocketEvents, ActivityLog } from './types';

export class WebSocketClient {
  private socket: Socket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private url: string = 'http://localhost:3000') {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      const token = AuthManager.getAccessToken();
      if (!token) {
        reject(new Error('No authentication token available'));
        return;
      }

      this.socket = io(this.url, {
        transports: ['websocket'],
        auth: {
          token
        }
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });

      // Setup event listeners
      this.setupEventListeners();
    });
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Authenticated event
    this.socket.on('authenticated', (data: { success: boolean; userId?: string; role?: string; error?: string }) => {
      if (data.success) {
        console.log('WebSocket authenticated successfully');
        this.emit('authenticated', data);
      } else {
        console.error('WebSocket authentication failed:', data.error);
      }
    });

    // Analysis events
    this.socket.on('analysis:created', (data: any) => {
      this.emit('analysis:created', data);
    });

    this.socket.on('analysis:completed', (data: any) => {
      this.emit('analysis:completed', data);
    });

    this.socket.on('analysis:error', (data: any) => {
      this.emit('analysis:error', data);
    });

    // Activity logging
    this.socket.on('activity:log', (data: ActivityLog) => {
      this.emit('activity:log', data);
    });

    // User status
    this.socket.on('user:status', (data: any) => {
      this.emit('user:status', data);
    });

    this.socket.on('user:disconnected', (data: any) => {
      this.emit('user:disconnected', data);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect().catch(err => {
          console.error('Reconnection failed:', err);
        });
      }, Math.min(1000 * 2 ** this.reconnectAttempts, 30000)); // Exponential backoff
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  on<T extends keyof WebSocketEvents>(event: T, callback: WebSocketEvents[T]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback as Function);
  }

  off<T extends keyof WebSocketEvents>(event: T, callback: WebSocketEvents[T]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback as Function);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit<T extends keyof WebSocketEvents>(event: T, data: Parameters<WebSocketEvents[T]>[0]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Analysis event emitters
  emitAnalysisStart(analysisId: string, userId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('analysis:start', { analysisId, userId });
    }
  }

  emitAnalysisComplete(analysisId: string, results: any): void {
    if (this.socket?.connected) {
      this.socket.emit('analysis:complete', { analysisId, results });
    }
  }

  emitAnalysisError(analysisId: string, userId: string, error: string): void {
    if (this.socket?.connected) {
      this.socket.emit('analysis:error', { analysisId, userId, error });
    }
  }

  // Activity logging
  emitActivity(userId: string, action: string, details?: any): void {
    if (this.socket?.connected) {
      this.socket.emit('activity:log', { userId, action, details });
    }
  }

  // User status
  emitUserStatus(userId: string, status: string): void {
    if (this.socket?.connected) {
      this.socket.emit('user:status', { userId, status });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create default instance
export const webSocketClient = new WebSocketClient();