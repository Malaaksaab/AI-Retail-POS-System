/**
 * =============================================================================
 * SERVER ENTRY POINT
 * =============================================================================
 * Starts the HTTP server and initializes all services
 * =============================================================================
 */

import { createApp } from './app';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './db';
import { log } from './utils/logger';
import { initializeWebSocket } from './websocket';
import { initializeQueues } from './queue';

/**
 * Start the server
 */
async function startServer() {
  try {
    // Connect to database
    log.info('Connecting to database...');
    await connectDatabase();

    // Initialize queues (Redis/BullMQ)
    log.info('Initializing queue system...');
    await initializeQueues();

    // Create Express app
    const app = createApp();

    // Start HTTP server
    const server = app.listen(config.server.port, () => {
      log.info(`🚀 HQ Backend server running on http://${config.server.host}:${config.server.port}`);
      log.info(`📊 Environment: ${config.server.env}`);
      log.info(`🔒 API Version: ${config.server.apiVersion}`);
    });

    // Initialize WebSocket server
    log.info('Initializing WebSocket server...');
    const io = initializeWebSocket(server);
    log.info(`🔌 WebSocket server running on port ${config.websocket.port}`);

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      log.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        log.info('HTTP server closed');

        // Close WebSocket server
        io.close();
        log.info('WebSocket server closed');

        // Disconnect from database
        await disconnectDatabase();

        log.info('Graceful shutdown complete');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        log.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      log.error('Uncaught Exception', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      log.error('Unhandled Rejection at:', { promise, reason });
      process.exit(1);
    });

  } catch (error) {
    log.error('Failed to start server', error);
    process.exit(1);
  }
}

// Start the server
startServer();
