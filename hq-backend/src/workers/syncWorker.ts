/**
 * =============================================================================
 * SYNC WORKER
 * =============================================================================
 * Background worker that processes sync jobs from the queue
 * =============================================================================
 */

import { Worker, Job } from 'bullmq';
import { redisConnection } from '../queue';
import { prisma } from '../db';
import { createConnector } from '../sync/ConnectorFactory';
import { log } from '../utils/logger';
import { events } from '../websocket';
import { SyncStatus } from '@prisma/client';

/**
 * Sync Products Job Handler
 */
async function syncProducts(job: Job) {
  const { storeId } = job.data;
  const startTime = Date.now();

  log.queue('sync-products', 'processing', { storeId, jobId: job.id });

  // Create sync log
  const syncLog = await prisma.syncLog.create({
    data: {
      storeId,
      syncType: 'products',
      status: SyncStatus.IN_PROGRESS,
    },
  });

  try {
    // Get store
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      throw new Error(`Store not found: ${storeId}`);
    }

    // Create connector
    const connector = createConnector(store);
    await connector.authenticate();

    // Fetch products from store
    let offset = 0;
    const limit = 100;
    let totalProducts = 0;
    let successCount = 0;
    let failCount = 0;

    while (true) {
      const products = await connector.fetchProducts(limit, offset);
      if (products.length === 0) break;

      // Upsert products in HQ database
      for (const product of products) {
        try {
          await prisma.product.upsert({
            where: {
              sku: product.sku,
            },
            update: {
              name: product.name,
              description: product.description,
              category: product.category,
              brand: product.brand,
              costPrice: product.costPrice,
              sellingPrice: product.sellingPrice,
              wholesalePrice: product.wholesalePrice,
              trackStock: product.trackStock,
              minStock: product.minStock,
              maxStock: product.maxStock,
              unit: product.unit,
              weight: product.weight,
              imageUrl: product.imageUrl,
              isActive: product.isActive,
              taxable: product.taxable,
              attributes: product.attributes as any,
              externalId: product.externalId,
              lastSyncedAt: new Date(),
            },
            create: {
              storeId: store.id,
              sku: product.sku,
              barcode: product.barcode,
              name: product.name,
              description: product.description,
              category: product.category,
              brand: product.brand,
              costPrice: product.costPrice,
              sellingPrice: product.sellingPrice,
              wholesalePrice: product.wholesalePrice,
              trackStock: product.trackStock,
              minStock: product.minStock,
              maxStock: product.maxStock,
              unit: product.unit,
              weight: product.weight,
              imageUrl: product.imageUrl,
              isActive: product.isActive,
              taxable: product.taxable,
              attributes: product.attributes as any,
              externalId: product.externalId,
              lastSyncedAt: new Date(),
            },
          });
          successCount++;
        } catch (error) {
          failCount++;
          log.error(`Failed to sync product: ${product.sku}`, error);
        }
      }

      totalProducts += products.length;
      offset += limit;

      // Update progress
      await job.updateProgress((offset / (offset + products.length)) * 100);
    }

    const duration = Date.now() - startTime;

    // Update sync log
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: SyncStatus.COMPLETED,
        completedAt: new Date(),
        duration,
        recordsTotal: totalProducts,
        recordsSuccess: successCount,
        recordsFailed: failCount,
      },
    });

    // Update store last sync
    await prisma.store.update({
      where: { id: storeId },
      data: { lastSyncAt: new Date() },
    });

    // Emit WebSocket event
    events.syncCompleted(storeId, 'products', {
      totalProducts,
      successCount,
      failCount,
      duration,
    });

    log.queue('sync-products', 'completed', {
      storeId,
      totalProducts,
      successCount,
      failCount,
      duration: `${duration}ms`,
    });

    return { success: true, totalProducts, successCount, failCount, duration };
  } catch (error) {
    const duration = Date.now() - startTime;

    // Update sync log
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: SyncStatus.FAILED,
        completedAt: new Date(),
        duration,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Emit WebSocket event
    events.syncFailed(storeId, 'products', error instanceof Error ? error.message : 'Unknown error');

    log.queue('sync-products', 'failed', { storeId, error });
    throw error;
  }
}

/**
 * Sync Inventory Job Handler
 */
async function syncInventory(job: Job) {
  const { storeId } = job.data;
  // Similar implementation to syncProducts...
  log.info(`Syncing inventory for store: ${storeId}`);
  // Implementation here...
}

/**
 * Sync Sales Job Handler
 */
async function syncSales(job: Job) {
  const { storeId, startDate, endDate } = job.data;
  // Similar implementation to syncProducts...
  log.info(`Syncing sales for store: ${storeId} from ${startDate} to ${endDate}`);
  // Implementation here...
}

/**
 * Create and start sync worker
 */
const syncWorker = new Worker(
  'sync',
  async (job: Job) => {
    switch (job.name) {
      case 'products':
        return await syncProducts(job);
      case 'inventory':
        return await syncInventory(job);
      case 'sales':
        return await syncSales(job);
      default:
        throw new Error(`Unknown sync job type: ${job.name}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

syncWorker.on('completed', (job) => {
  log.info(`Sync job completed: ${job.name}`, { jobId: job.id });
});

syncWorker.on('failed', (job, error) => {
  log.error(`Sync job failed: ${job?.name}`, error, { jobId: job?.id });
});

log.info('Sync worker started');

export default syncWorker;
