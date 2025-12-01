/**
 * =============================================================================
 * CONFIGURATION MODULE
 * =============================================================================
 * Centralized configuration management for the HQ backend system
 * Loads and validates environment variables with type safety
 * =============================================================================
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Validates that a required environment variable exists
 * @param key - Environment variable name
 * @param defaultValue - Optional default value
 * @returns The environment variable value
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value!;
}

/**
 * Application Configuration Object
 */
export const config = {
  // =============================================================================
  // SERVER CONFIGURATION
  // =============================================================================
  server: {
    env: getEnvVar('NODE_ENV', 'development'),
    port: parseInt(getEnvVar('PORT', '4000')),
    host: getEnvVar('HOST', 'localhost'),
    apiVersion: getEnvVar('API_VERSION', 'v1'),
    isDevelopment: getEnvVar('NODE_ENV', 'development') === 'development',
    isProduction: getEnvVar('NODE_ENV', 'development') === 'production',
  },

  // =============================================================================
  // DATABASE CONFIGURATION
  // =============================================================================
  database: {
    url: getEnvVar('DATABASE_URL'),
  },

  // =============================================================================
  // JWT CONFIGURATION
  // =============================================================================
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    refreshSecret: getEnvVar('JWT_REFRESH_SECRET'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '15m'),
    refreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  // =============================================================================
  // REDIS CONFIGURATION
  // =============================================================================
  redis: {
    host: getEnvVar('REDIS_HOST', 'localhost'),
    port: parseInt(getEnvVar('REDIS_PORT', '6379')),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(getEnvVar('REDIS_DB', '0')),
  },

  // =============================================================================
  // WEBSOCKET CONFIGURATION
  // =============================================================================
  websocket: {
    port: parseInt(getEnvVar('WS_PORT', '4001')),
    corsOrigin: getEnvVar('WS_CORS_ORIGIN', 'http://localhost:5173'),
  },

  // =============================================================================
  // SYNC CONFIGURATION
  // =============================================================================
  sync: {
    intervalMinutes: parseInt(getEnvVar('SYNC_INTERVAL_MINUTES', '5')),
    batchSize: parseInt(getEnvVar('SYNC_BATCH_SIZE', '100')),
    retryAttempts: parseInt(getEnvVar('SYNC_RETRY_ATTEMPTS', '3')),
    retryDelayMs: parseInt(getEnvVar('SYNC_RETRY_DELAY_MS', '5000')),
  },

  // =============================================================================
  // LOGGING CONFIGURATION
  // =============================================================================
  logging: {
    level: getEnvVar('LOG_LEVEL', 'info'),
    file: getEnvVar('LOG_FILE', 'logs/hq-backend.log'),
    maxSize: getEnvVar('LOG_MAX_SIZE', '10m'),
    maxFiles: getEnvVar('LOG_MAX_FILES', '14d'),
  },

  // =============================================================================
  // RATE LIMITING
  // =============================================================================
  rateLimit: {
    windowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000')), // 15 minutes
    maxRequests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100')),
  },

  // =============================================================================
  // CORS CONFIGURATION
  // =============================================================================
  cors: {
    origin: getEnvVar('CORS_ORIGIN', 'http://localhost:5173').split(','),
  },

  // =============================================================================
  // SECURITY CONFIGURATION
  // =============================================================================
  security: {
    bcryptRounds: parseInt(getEnvVar('BCRYPT_ROUNDS', '12')),
    sessionSecret: getEnvVar('SESSION_SECRET'),
    cookieSecure: getEnvVar('COOKIE_SECURE', 'false') === 'true',
    cookieHttpOnly: getEnvVar('COOKIE_HTTP_ONLY', 'true') === 'true',
    cookieSameSite: getEnvVar('COOKIE_SAME_SITE', 'strict') as 'strict' | 'lax' | 'none',
  },

  // =============================================================================
  // FILE UPLOAD CONFIGURATION
  // =============================================================================
  upload: {
    maxSize: parseInt(getEnvVar('UPLOAD_MAX_SIZE', '10485760')), // 10MB
    allowedTypes: getEnvVar(
      'UPLOAD_ALLOWED_TYPES',
      'image/jpeg,image/png,image/gif,application/pdf'
    ).split(','),
  },

  // =============================================================================
  // FEATURE FLAGS
  // =============================================================================
  features: {
    aiInsights: getEnvVar('ENABLE_AI_INSIGHTS', 'true') === 'true',
    autoSync: getEnvVar('ENABLE_AUTO_SYNC', 'true') === 'true',
    notifications: getEnvVar('ENABLE_NOTIFICATIONS', 'true') === 'true',
    auditLog: getEnvVar('ENABLE_AUDIT_LOG', 'true') === 'true',
  },

  // =============================================================================
  // STORE CONFIGURATIONS
  // =============================================================================
  stores: {
    // Store 1
    store1: {
      id: getEnvVar('STORE_1_ID', 'store-001'),
      name: getEnvVar('STORE_1_NAME', 'Main Store'),
      type: getEnvVar('STORE_1_TYPE', 'supabase'),
      supabaseUrl: process.env.STORE_1_SUPABASE_URL,
      supabaseAnonKey: process.env.STORE_1_SUPABASE_ANON_KEY,
      supabaseServiceKey: process.env.STORE_1_SUPABASE_SERVICE_KEY,
    },
    // Store 2
    store2: {
      id: getEnvVar('STORE_2_ID', 'store-002'),
      name: getEnvVar('STORE_2_NAME', 'Branch Store'),
      type: getEnvVar('STORE_2_TYPE', 'supabase'),
      supabaseUrl: process.env.STORE_2_SUPABASE_URL,
      supabaseAnonKey: process.env.STORE_2_SUPABASE_ANON_KEY,
      supabaseServiceKey: process.env.STORE_2_SUPABASE_SERVICE_KEY,
    },
    // Store 3
    store3: {
      id: getEnvVar('STORE_3_ID', 'store-003'),
      name: getEnvVar('STORE_3_NAME', 'Third Store'),
      type: getEnvVar('STORE_3_TYPE', 'esaletab'),
      apiUrl: process.env.STORE_3_API_URL,
      apiKey: process.env.STORE_3_API_KEY,
      username: process.env.STORE_3_USERNAME,
      password: process.env.STORE_3_PASSWORD,
    },
  },

  // =============================================================================
  // EMAIL CONFIGURATION (Optional)
  // =============================================================================
  email: {
    enabled: !!process.env.SMTP_HOST,
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || 'HQ System <noreply@hqsystem.com>',
  },

  // =============================================================================
  // MONITORING & ALERTS
  // =============================================================================
  monitoring: {
    enabled: getEnvVar('ENABLE_MONITORING', 'true') === 'true',
    alertEmail: process.env.ALERT_EMAIL,
    webhookUrl: process.env.ALERT_WEBHOOK_URL,
  },
};

/**
 * Export individual config sections for convenience
 */
export const {
  server,
  database,
  jwt,
  redis,
  websocket,
  sync,
  logging,
  rateLimit,
  cors,
  security,
  upload,
  features,
  stores,
  email,
  monitoring,
} = config;

export default config;
