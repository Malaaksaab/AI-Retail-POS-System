/**
 * =============================================================================
 * QUEUE SYSTEM (BullMQ + Redis)
 * =============================================================================
 * Manages async jobs for safe store synchronization
 * =============================================================================
 */

import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';
import { log } from '../utils/logger';

// =============================================================================
// REDIS CONNECTION
// =============================================================================

export const redisConnection = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => {
  log.info('Redis connected successfully');
});

redisConnection.on('error', (error) => {
  log.error('Redis connection error', error);
});

// =============================================================================
// QUEUE DEFINITIONS
// =============================================================================

export const syncQueue = new Queue('sync', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: config.sync.retryAttempts,
    backoff: {
      type: 'exponential',
      delay: config.sync.retryDelayMs,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 86400, // Keep for 24 hours
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs
    },
  },
});

export const priceUpdateQueue = new Queue('price-update', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'fixed',
      delay: 5000,
    },
  },
});

export const inventoryQueue = new Queue('inventory', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
  },
});

export const promotionQueue = new Queue('promotion', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 10000,
    },
  },
});

// =============================================================================
// QUEUE OPERATIONS
// =============================================================================

/**
 * Add sync job to queue
 */
export async function addSyncJob(storeId: string, syncType: string, options: any = {}) {
  try {
    const job = await syncQueue.add(
      syncType,
      {
        storeId,
        syncType,
        ...options,
      },
      {
        priority: options.priority || 5,
        delay: options.delay || 0,
      }
    );

    log.queue(`sync-${syncType}`, 'added', { storeId, jobId: job.id });
    return job;
  } catch (error) {
    log.error('Failed to add sync job', error, { storeId, syncType });
    throw error;
  }
}

/**
 * Add price update job
 */
export async function addPriceUpdateJob(storeId: string, priceUpdates: any[]) {
  try {
    const job = await priceUpdateQueue.add('update-prices', {
      storeId,
      priceUpdates,
    });

    log.queue('price-update', 'added', { storeId, jobId: job.id, count: priceUpdates.length });
    return job;
  } catch (error) {
    log.error('Failed to add price update job', error, { storeId });
    throw error;
  }
}

/**
 * Add inventory adjustment job
 */
export async function addInventoryJob(storeId: string, adjustments: any[]) {
  try {
    const job = await inventoryQueue.add('adjust-inventory', {
      storeId,
      adjustments,
    });

    log.queue('inventory-adjustment', 'added', { storeId, jobId: job.id });
    return job;
  } catch (error) {
    log.error('Failed to add inventory job', error, { storeId });
    throw error;
  }
}

/**
 * Add promotion push job
 */
export async function addPromotionJob(storeIds: string[], promotion: any) {
  try {
    const jobs = await Promise.all(
      storeIds.map((storeId) =>
        promotionQueue.add('push-promotion', {
          storeId,
          promotion,
        })
      )
    );

    log.queue('promotion-push', 'added', { storeCount: storeIds.length });
    return jobs;
  } catch (error) {
    log.error('Failed to add promotion jobs', error);
    throw error;
  }
}

// =============================================================================
// QUEUE MONITORING
// =============================================================================

/**
 * Get queue stats
 */
export async function getQueueStats(queueName: string) {
  const queue = getQueueByName(queueName);
  if (!queue) {
    throw new Error(`Queue not found: ${queueName}`);
  }

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

/**
 * Get all queue stats
 */
export async function getAllQueueStats() {
  const [syncStats, priceStats, inventoryStats, promotionStats] = await Promise.all([
    getQueueStats('sync'),
    getQueueStats('price-update'),
    getQueueStats('inventory'),
    getQueueStats('promotion'),
  ]);

  return {
    sync: syncStats,
    priceUpdate: priceStats,
    inventory: inventoryStats,
    promotion: promotionStats,
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function getQueueByName(name: string): Queue | null {
  switch (name) {
    case 'sync':
      return syncQueue;
    case 'price-update':
      return priceUpdateQueue;
    case 'inventory':
      return inventoryQueue;
    case 'promotion':
      return promotionQueue;
    default:
      return null;
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

export async function initializeQueues() {
  try {
    // Test Redis connection
    await redisConnection.ping();
    log.info('Queue system initialized successfully');
  } catch (error) {
    log.error('Failed to initialize queue system', error);
    throw error;
  }
}

export default {
  syncQueue,
  priceUpdateQueue,
  inventoryQueue,
  promotionQueue,
  addSyncJob,
  addPriceUpdateJob,
  addInventoryJob,
  addPromotionJob,
  getQueueStats,
  getAllQueueStats,
  initializeQueues,
};
