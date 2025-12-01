/**
 * =============================================================================
 * VALIDATION UTILITIES
 * =============================================================================
 * Zod-based validation schemas and helpers
 * =============================================================================
 */

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errors';

/**
 * Validate request body, query, or params against a Zod schema
 */
export function validate(schema: z.ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validated = schema.parse(data);
      req[source] = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Common validation schemas
 */
export const schemas = {
  // Pagination
  pagination: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : 20)),
  }),

  // UUID
  uuid: z.string().uuid('Invalid UUID'),

  // Email
  email: z.string().email('Invalid email address'),

  // Date range
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),

  // Store ID
  storeId: z.string().uuid('Invalid store ID'),
};

export default validate;
