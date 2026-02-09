/**
 * =============================================================================
 * EXPRESS APPLICATION
 * =============================================================================
 * Main Express application with middleware and routes
 * =============================================================================
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { config } from './config';
import { errorHandler, notFoundHandler } from './utils/errors';
import { log } from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import storeRoutes from './routes/store.routes';
import productRoutes from './routes/product.routes';
import inventoryRoutes from './routes/inventory.routes';
import salesRoutes from './routes/sales.routes';
import transferRoutes from './routes/transfer.routes';
import employeeRoutes from './routes/employee.routes';
import promotionRoutes from './routes/promotion.routes';
import syncRoutes from './routes/sync.routes';
import analyticsRoutes from './routes/analytics.routes';
import alertRoutes from './routes/alert.routes';

/**
 * Create Express Application
 */
export function createApp(): Application {
  const app = express();

  // =============================================================================
  // SECURITY MIDDLEWARE
  // =============================================================================
  app.use(helmet()); // Security headers
  app.use(cors({
    origin: config.cors.origin,
    credentials: true,
  }));

  // =============================================================================
  // REQUEST PARSING MIDDLEWARE
  // =============================================================================
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // =============================================================================
  // LOGGING MIDDLEWARE
  // =============================================================================
  if (config.server.isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', {
      stream: {
        write: (message: string) => log.http(message.trim()),
      },
    }));
  }

  // =============================================================================
  // RATE LIMITING
  // =============================================================================
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // =============================================================================
  // HEALTH CHECK ENDPOINT
  // =============================================================================
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.env,
    });
  });

  // =============================================================================
  // API ROUTES
  // =============================================================================
  const apiPrefix = `/api/${config.server.apiVersion}`;

  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/users`, userRoutes);
  app.use(`${apiPrefix}/stores`, storeRoutes);
  app.use(`${apiPrefix}/products`, productRoutes);
  app.use(`${apiPrefix}/inventory`, inventoryRoutes);
  app.use(`${apiPrefix}/sales`, salesRoutes);
  app.use(`${apiPrefix}/transfers`, transferRoutes);
  app.use(`${apiPrefix}/employees`, employeeRoutes);
  app.use(`${apiPrefix}/promotions`, promotionRoutes);
  app.use(`${apiPrefix}/sync`, syncRoutes);
  app.use(`${apiPrefix}/analytics`, analyticsRoutes);
  app.use(`${apiPrefix}/alerts`, alertRoutes);

  // =============================================================================
  // ERROR HANDLING
  // =============================================================================
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
