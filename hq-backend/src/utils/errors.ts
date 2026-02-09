/**
 * =============================================================================
 * ERROR HANDLING UTILITIES
 * =============================================================================
 * Custom error classes and error handling middleware
 * Provides consistent error responses across the API
 * =============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { log } from './logger';

/**
 * Base Application Error Class
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

/**
 * Validation Error (422)
 */
export class ValidationError extends AppError {
  public errors: any[];

  constructor(message: string = 'Validation failed', errors: any[] = []) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
  }
}

/**
 * Service Unavailable Error (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503);
  }
}

/**
 * Error Response Interface
 */
interface ErrorResponse {
  status: 'error';
  statusCode: number;
  message: string;
  errors?: any[];
  stack?: string;
}

/**
 * Format error response
 */
export function formatErrorResponse(error: AppError | Error, includeStack: boolean = false): ErrorResponse {
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      status: 'error',
      statusCode: error.statusCode,
      message: error.message,
    };

    if (error instanceof ValidationError && error.errors.length > 0) {
      response.errors = error.errors;
    }

    if (includeStack && error.stack) {
      response.stack = error.stack;
    }

    return response;
  }

  // Generic error
  return {
    status: 'error',
    statusCode: 500,
    message: error.message || 'An unexpected error occurred',
    ...(includeStack && error.stack ? { stack: error.stack } : {}),
  };
}

/**
 * Express error handling middleware
 */
export function errorHandler(err: Error | AppError, req: Request, res: Response, next: NextFunction) {
  // Log the error
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      log.error('Application error', err, {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
      });
    } else {
      log.warn(`Client error: ${err.message}`, {
        url: req.originalUrl,
        method: req.method,
        statusCode: err.statusCode,
      });
    }
  } else {
    log.error('Unhandled error', err, {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  }

  // Send error response
  const errorResponse = formatErrorResponse(err, process.env.NODE_ENV !== 'production');
  res.status(errorResponse.statusCode).json(errorResponse);
}

/**
 * Async route handler wrapper
 * Catches errors from async route handlers and passes them to error middleware
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not Found Handler (404)
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
}
