import { useState, useEffect } from 'react';
import { db } from '../services/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useProducts(storeId?: string) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await db.products.getAll(storeId);
        setProducts(data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    channel = db.products.subscribe((data) => setProducts(data || []), storeId);

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [storeId]);

  return { products, loading, error, refresh: () => db.products.getAll(storeId).then(setProducts) };
}

export function useCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await db.categories.getAll();
        setCategories(data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
    channel = db.categories.subscribe((data) => setCategories(data || []));

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  return { categories, loading, error, refresh: () => db.categories.getAll().then(setCategories) };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const loadCustomers = async () => {
      try {
        setLoading(true);
        const data = await db.customers.getAll();
        setCustomers(data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
    channel = db.customers.subscribe((data) => setCustomers(data || []));

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  return { customers, loading, error, refresh: () => db.customers.getAll().then(setCustomers) };
}

export function useTransactions(storeId?: string, limit?: number) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const loadTransactions = async () => {
      try {
        setLoading(true);
        const data = await db.transactions.getAll(storeId, limit);
        setTransactions(data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
    channel = db.transactions.subscribe((data) => setTransactions(data || []), storeId);

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [storeId, limit]);

  return { transactions, loading, error, refresh: () => db.transactions.getAll(storeId, limit).then(setTransactions) };
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const loadSuppliers = async () => {
      try {
        setLoading(true);
        const data = await db.suppliers.getAll();
        setSuppliers(data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadSuppliers();
    channel = db.suppliers.subscribe((data) => setSuppliers(data || []));

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  return { suppliers, loading, error, refresh: () => db.suppliers.getAll().then(setSuppliers) };
}

export function useStores() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const loadStores = async () => {
      try {
        setLoading(true);
        const data = await db.stores.getAll();
        setStores(data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
    channel = db.stores.subscribe((data) => setStores(data || []));

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  return { stores, loading, error, refresh: () => db.stores.getAll().then(setStores) };
}

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await db.users.getAll();
        setUsers(data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
    channel = db.users.subscribe((data) => setUsers(data || []));

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  return { users, loading, error, refresh: () => db.users.getAll().then(setUsers) };
}

export function useInventoryTransfers() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const loadTransfers = async () => {
      try {
        setLoading(true);
        const data = await db.inventoryTransfers.getAll();
        setTransfers(data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadTransfers();
    channel = db.inventoryTransfers.subscribe((data) => setTransfers(data || []));

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  return { transfers, loading, error, refresh: () => db.inventoryTransfers.getAll().then(setTransfers) };
}

export function useHeldOrders(storeId?: string) {
  const [heldOrders, setHeldOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const loadHeldOrders = async () => {
      try {
        setLoading(true);
        const data = await db.heldOrders.getAll(storeId);
        setHeldOrders(data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadHeldOrders();
    channel = db.heldOrders.subscribe((data) => setHeldOrders(data || []), storeId);

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [storeId]);

  return { heldOrders, loading, error, refresh: () => db.heldOrders.getAll(storeId).then(setHeldOrders) };
}

export function usePromotions() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const loadPromotions = async () => {
      try {
        setLoading(true);
        const data = await db.promotions.getAll();
        setPromotions(data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadPromotions();
    channel = db.promotions.subscribe((data) => setPromotions(data || []));

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  return { promotions, loading, error, refresh: () => db.promotions.getAll().then(setPromotions) };
}

export function useAlerts(userId?: string) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const loadAlerts = async () => {
      try {
        setLoading(true);
        const data = await db.alerts.getAll(userId);
        setAlerts(data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
    channel = db.alerts.subscribe((data) => setAlerts(data || []), userId);

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [userId]);

  return { alerts, loading, error, refresh: () => db.alerts.getAll(userId).then(setAlerts) };
}
