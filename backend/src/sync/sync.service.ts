import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(
    @InjectQueue('sync') private syncQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async queueSync(data: {
    storeId: string;
    entityType: string;
    entityId: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    payload: any;
    priority?: number;
  }) {
    const record = await this.prisma.syncQueue.create({
      data: {
        storeId: data.storeId,
        entityType: data.entityType,
        entityId: data.entityId,
        operation: data.operation,
        payload: data.payload,
        status: 'PENDING',
        priority: data.priority || 0,
      },
    });

    await this.syncQueue.add('process-sync', {
      syncQueueId: record.id,
    }, {
      priority: data.priority || 0,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });

    return record;
  }

  async getPendingSync(storeId: string) {
    return this.prisma.syncQueue.findMany({
      where: {
        storeId,
        status: 'PENDING',
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
      take: 100,
    });
  }

  async markSynced(id: string) {
    return this.prisma.syncQueue.update({
      where: { id },
      data: {
        status: 'SYNCED',
        syncedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, error: string) {
    return this.prisma.syncQueue.update({
      where: { id },
      data: {
        status: 'FAILED',
        lastError: error,
        attempts: { increment: 1 },
      },
    });
  }

  async batchSync(storeId: string, data: Array<{
    entityType: string;
    entityId: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    payload: any;
  }>) {
    const results = await Promise.allSettled(
      data.map((item) =>
        this.queueSync({
          storeId,
          ...item,
        }),
      ),
    );

    return {
      total: data.length,
      success: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    };
  }

  async syncTransactions(storeId: string, transactions: any[]) {
    const results = [];

    for (const txn of transactions) {
      try {
        const existing = await this.prisma.transaction.findUnique({
          where: { transactionNumber: txn.transactionNumber },
        });

        if (existing) {
          if (existing.updatedAt < new Date(txn.updatedAt)) {
            await this.prisma.transaction.update({
              where: { id: existing.id },
              data: {
                ...txn,
                syncStatus: 'SYNCED',
                syncedAt: new Date(),
              },
            });
            results.push({ id: txn.transactionNumber, status: 'updated' });
          } else {
            results.push({ id: txn.transactionNumber, status: 'skipped' });
          }
        } else {
          await this.prisma.transaction.create({
            data: {
              ...txn,
              syncStatus: 'SYNCED',
              syncedAt: new Date(),
            },
          });
          results.push({ id: txn.transactionNumber, status: 'created' });
        }
      } catch (error) {
        results.push({
          id: txn.transactionNumber,
          status: 'error',
          error: error.message,
        });
      }
    }

    return results;
  }

  async syncInventory(storeId: string, inventoryUpdates: any[]) {
    const results = [];

    for (const update of inventoryUpdates) {
      try {
        const inventory = await this.prisma.inventoryItem.findFirst({
          where: {
            storeId,
            productId: update.productId,
          },
        });

        if (inventory) {
          await this.prisma.inventoryItem.update({
            where: { id: inventory.id },
            data: {
              quantity: update.quantity,
              available: update.available,
              lastSyncedAt: new Date(),
            },
          });
          results.push({ productId: update.productId, status: 'updated' });
        } else {
          results.push({ productId: update.productId, status: 'not_found' });
        }
      } catch (error) {
        results.push({
          productId: update.productId,
          status: 'error',
          error: error.message,
        });
      }
    }

    return results;
  }
}
