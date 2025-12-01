/**
 * =============================================================================
 * WEBSOCKET SERVER
 * =============================================================================
 * Real-time communication for HQ dashboard
 * =============================================================================
 */

import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { log } from '../utils/logger';

let io: Server;

/**
 * Initialize WebSocket server
 */
export function initializeWebSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
    path: '/ws',
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; email: string };
      (socket as any).userId = decoded.userId;
      (socket as any).userEmail = decoded.email;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    const userEmail = (socket as any).userEmail;

    log.info(`WebSocket client connected: ${userEmail}`, { userId, socketId: socket.id });

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Handle store subscription
    socket.on('subscribe:store', (storeId: string) => {
      socket.join(`store:${storeId}`);
      log.debug(`User subscribed to store updates`, { userId, storeId });
    });

    // Handle store unsubscription
    socket.on('unsubscribe:store', (storeId: string) => {
      socket.leave(`store:${storeId}`);
      log.debug(`User unsubscribed from store updates`, { userId, storeId });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      log.info(`WebSocket client disconnected: ${userEmail}`, { userId, socketId: socket.id });
    });
  });

  log.info('WebSocket server initialized');
  return io;
}

/**
 * Emit event to all connected clients
 */
export function emitToAll(event: string, data: any) {
  if (io) {
    io.emit(event, data);
  }
}

/**
 * Emit event to specific user
 */
export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Emit event to specific store subscribers
 */
export function emitToStore(storeId: string, event: string, data: any) {
  if (io) {
    io.to(`store:${storeId}`).emit(event, data);
  }
}

/**
 * Real-time event emitters
 */
export const events = {
  // Sync events
  syncStarted: (storeId: string, syncType: string) => {
    emitToStore(storeId, 'sync:started', { storeId, syncType, timestamp: new Date() });
  },

  syncCompleted: (storeId: string, syncType: string, result: any) => {
    emitToStore(storeId, 'sync:completed', { storeId, syncType, result, timestamp: new Date() });
  },

  syncFailed: (storeId: string, syncType: string, error: string) => {
    emitToStore(storeId, 'sync:failed', { storeId, syncType, error, timestamp: new Date() });
  },

  // Sales events
  newSale: (storeId: string, sale: any) => {
    emitToStore(storeId, 'sale:new', { storeId, sale, timestamp: new Date() });
    emitToAll('sale:new', { storeId, sale, timestamp: new Date() });
  },

  // Inventory events
  lowStock: (storeId: string, product: any) => {
    emitToStore(storeId, 'inventory:low-stock', { storeId, product, timestamp: new Date() });
    emitToAll('alert:low-stock', { storeId, product, timestamp: new Date() });
  },

  stockUpdated: (storeId: string, product: any) => {
    emitToStore(storeId, 'inventory:updated', { storeId, product, timestamp: new Date() });
  },

  // Transfer events
  transferRequested: (transfer: any) => {
    emitToStore(transfer.fromStoreId, 'transfer:requested', { transfer, timestamp: new Date() });
    emitToStore(transfer.toStoreId, 'transfer:requested', { transfer, timestamp: new Date() });
  },

  transferApproved: (transfer: any) => {
    emitToStore(transfer.fromStoreId, 'transfer:approved', { transfer, timestamp: new Date() });
    emitToStore(transfer.toStoreId, 'transfer:approved', { transfer, timestamp: new Date() });
  },

  // Alert events
  alert: (alert: any) => {
    if (alert.storeId) {
      emitToStore(alert.storeId, 'alert:new', { alert, timestamp: new Date() });
    }
    emitToAll('alert:new', { alert, timestamp: new Date() });
  },

  // System events
  systemStatus: (status: any) => {
    emitToAll('system:status', { status, timestamp: new Date() });
  },
};

export { io };
export default initializeWebSocket;
