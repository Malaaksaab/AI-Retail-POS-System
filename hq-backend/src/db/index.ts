/**
 * =============================================================================
 * DATABASE CONNECTION
 * =============================================================================
 * Prisma client instance and database utilities
 * =============================================================================
 */

import { PrismaClient } from '@prisma/client';
import { log } from '../utils/logger';

/**
 * Prisma Client Instance with logging
 */
export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: any) => {
    log.debug('Database Query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

// Log database errors
prisma.$on('error' as never, (e: any) => {
  log.error('Database Error', e);
});

// Log database warnings
prisma.$on('warn' as never, (e: any) => {
  log.warn('Database Warning', e);
});

/**
 * Connect to database
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    log.info('Database connected successfully');
  } catch (error) {
    log.error('Failed to connect to database', error);
    throw error;
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    log.info('Database disconnected');
  } catch (error) {
    log.error('Error disconnecting from database', error);
    throw error;
  }
}

/**
 * Health check - test database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    log.error('Database health check failed', error);
    return false;
  }
}

export default prisma;
