/**
 * =============================================================================
 * CONNECTOR FACTORY
 * =============================================================================
 * Factory to create the appropriate connector based on store type
 * =============================================================================
 */

import { BaseConnector } from './BaseConnector';
import { SupabaseConnector } from './SupabaseConnector';
import { ESaletabConnector } from './ESaletabConnector';
import { Store, StoreType } from '@prisma/client';
import { log } from '../utils/logger';

/**
 * Store connector cache
 */
const connectorCache = new Map<string, BaseConnector>();

/**
 * Create a connector instance for a store
 */
export function createConnector(store: Store): BaseConnector {
  // Check cache first
  if (connectorCache.has(store.id)) {
    return connectorCache.get(store.id)!;
  }

  let connector: BaseConnector;

  // Parse API configuration
  const config = store.apiConfig as any;

  // Create appropriate connector based on store type
  switch (store.type) {
    case StoreType.SUPABASE:
      connector = new SupabaseConnector(store.id, store.name, {
        supabaseUrl: config.supabaseUrl,
        supabaseAnonKey: config.supabaseAnonKey,
        supabaseServiceKey: config.supabaseServiceKey,
      });
      break;

    case StoreType.ESALETAB:
      connector = new ESaletabConnector(store.id, store.name, {
        apiUrl: config.apiUrl,
        apiKey: config.apiKey,
        username: config.username,
        password: config.password,
      });
      break;

    case StoreType.CUSTOM_API:
      // For custom APIs, you can create a custom connector
      // For now, we'll throw an error
      throw new Error(`Custom API connectors not yet implemented for store: ${store.name}`);

    default:
      throw new Error(`Unsupported store type: ${store.type} for store: ${store.name}`);
  }

  // Cache the connector
  connectorCache.set(store.id, connector);

  log.info(`Created ${store.type} connector for store: ${store.name}`, { storeId: store.id });

  return connector;
}

/**
 * Get connector from cache
 */
export function getConnector(storeId: string): BaseConnector | null {
  return connectorCache.get(storeId) || null;
}

/**
 * Remove connector from cache
 */
export function removeConnector(storeId: string): void {
  connectorCache.delete(storeId);
  log.info(`Removed connector from cache`, { storeId });
}

/**
 * Clear all connectors from cache
 */
export function clearAllConnectors(): void {
  connectorCache.clear();
  log.info('Cleared all connectors from cache');
}

/**
 * Get all cached connector IDs
 */
export function getCachedConnectorIds(): string[] {
  return Array.from(connectorCache.keys());
}

export default {
  createConnector,
  getConnector,
  removeConnector,
  clearAllConnectors,
  getCachedConnectorIds,
};
