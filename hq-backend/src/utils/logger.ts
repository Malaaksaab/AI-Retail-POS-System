/**
 * =============================================================================
 * LOGGER UTILITY
 * =============================================================================
 * Winston-based logger with file rotation and multiple transports
 * Provides structured logging for the entire application
 * =============================================================================
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

// Ensure logs directory exists
const logsDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = `\n${JSON.stringify(meta, null, 2)}`;
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'hq-backend' },
  transports: [
    // File transport for errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  ],
});

// Add console transport in development
if (config.server.isDevelopment) {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

/**
 * Logger with additional helper methods
 */
export const log = {
  /**
   * Log info message
   */
  info: (message: string, meta?: any) => {
    logger.info(message, meta);
  },

  /**
   * Log error message
   */
  error: (message: string, error?: Error | any, meta?: any) => {
    const errorMeta = {
      ...meta,
      ...(error instanceof Error
        ? {
            error: error.message,
            stack: error.stack,
          }
        : { error }),
    };
    logger.error(message, errorMeta);
  },

  /**
   * Log warning message
   */
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta);
  },

  /**
   * Log debug message
   */
  debug: (message: string, meta?: any) => {
    logger.debug(message, meta);
  },

  /**
   * Log HTTP request
   */
  http: (message: string, meta?: any) => {
    logger.http(message, meta);
  },

  /**
   * Log sync operation
   */
  sync: (storeId: string, operation: string, status: 'started' | 'completed' | 'failed', meta?: any) => {
    logger.info(`Sync ${operation} ${status}`, {
      storeId,
      operation,
      status,
      ...meta,
    });
  },

  /**
   * Log queue operation
   */
  queue: (jobName: string, status: 'added' | 'processing' | 'completed' | 'failed', meta?: any) => {
    logger.info(`Queue job ${jobName} ${status}`, {
      jobName,
      status,
      ...meta,
    });
  },

  /**
   * Log database operation
   */
  db: (operation: string, table: string, status: 'success' | 'error', meta?: any) => {
    const level = status === 'error' ? 'error' : 'debug';
    logger.log(level, `Database ${operation} on ${table}`, {
      operation,
      table,
      status,
      ...meta,
    });
  },

  /**
   * Log API request
   */
  api: (method: string, path: string, statusCode: number, duration?: number, meta?: any) => {
    logger.http(`${method} ${path} ${statusCode}`, {
      method,
      path,
      statusCode,
      duration,
      ...meta,
    });
  },
};

export default logger;
