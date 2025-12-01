import axios from 'axios';
import { db } from '../db/schema';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export class SyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;

  async startAutoSync(intervalMs = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      await this.syncAll();
    }, intervalMs);

    await this.syncAll();
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncAll() {
    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;

    try {
      await this.syncTransactions();
      await this.syncInventory();
      await this.syncShifts();
      await this.pullProducts();
      await this.pullCustomers();

      await db.settings.update('main', {
        lastSync: new Date(),
      });

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  async syncTransactions() {
    const pendingTransactions = await db.transactions
      .where('syncStatus')
      .equals('PENDING')
      .toArray();

    if (pendingTransactions.length === 0) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await axios.post(
        `${API_URL}/sync/transactions`,
        {
          storeId: localStorage.getItem('storeId'),
          transactions: pendingTransactions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
        }
      );

      const results = response.data;

      for (const txn of pendingTransactions) {
        const result = results.find((r: any) => r.id === txn.transactionNumber);

        if (result && ['created', 'updated'].includes(result.status)) {
          await db.transactions.update(txn.id, {
            syncStatus: 'SYNCED',
            syncedAt: new Date(),
          });
        }
      }

      toast.success(`Synced ${pendingTransactions.length} transactions`);
    } catch (error: any) {
      console.error('Transaction sync failed:', error);

      if (error.code === 'ECONNABORTED' || error.code === 'ENETUNREACH') {
        toast.error('Network unavailable. Transactions saved locally.');
      } else {
        toast.error('Sync failed. Will retry automatically.');
      }

      throw error;
    }
  }

  async syncInventory() {
    const settings = await db.settings.get('main');
    if (!settings) return;

    const inventoryUpdates = await db.transactions
      .where('syncStatus')
      .equals('SYNCED')
      .and((txn) => txn.type === 'SALE')
      .toArray();

    if (inventoryUpdates.length === 0) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      await axios.post(
        `${API_URL}/sync/inventory`,
        {
          storeId: settings.storeId,
          inventory: inventoryUpdates.flatMap((txn) =>
            txn.items.map((item) => ({
              productId: item.productId,
              quantityChange: -item.quantity,
            }))
          ),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Inventory sync failed:', error);
    }
  }

  async syncShifts() {
    const pendingShifts = await db.shifts
      .where('syncStatus')
      .equals('PENDING')
      .toArray();

    if (pendingShifts.length === 0) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      for (const shift of pendingShifts) {
        await axios.post(
          `${API_URL}/shifts`,
          shift,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        await db.shifts.update(shift.id, {
          syncStatus: 'SYNCED',
        });
      }
    } catch (error) {
      console.error('Shift sync failed:', error);
    }
  }

  async pullProducts() {
    const settings = await db.settings.get('main');
    if (!settings) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await axios.get(
        `${API_URL}/products?storeId=${settings.storeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const products = response.data;

      for (const product of products) {
        await db.products.put({
          ...product,
          lastSynced: new Date(),
        });
      }

      console.log(`Pulled ${products.length} products`);
    } catch (error) {
      console.error('Product pull failed:', error);
    }
  }

  async pullCustomers() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const customers = response.data;

      for (const customer of customers) {
        await db.customers.put({
          ...customer,
          lastSynced: new Date(),
        });
      }

      console.log(`Pulled ${customers.length} customers`);
    } catch (error) {
      console.error('Customer pull failed:', error);
    }
  }

  async retryFailedSync() {
    const failedItems = await db.syncQueue
      .where('status')
      .equals('FAILED')
      .toArray();

    for (const item of failedItems) {
      try {
        await this.syncAll();

        await db.syncQueue.update(item.id!, {
          status: 'SYNCED',
        });
      } catch (error) {
        await db.syncQueue.update(item.id!, {
          attempts: item.attempts + 1,
          error: (error as Error).message,
        });
      }
    }
  }

  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      autoSyncEnabled: this.syncInterval !== null,
    };
  }
}

export const syncService = new SyncService();
