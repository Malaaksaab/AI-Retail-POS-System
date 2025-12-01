/**
 * =============================================================================
 * API RESPONSE UTILITIES
 * =============================================================================
 * Standardized response format for all API endpoints
 * =============================================================================
 */

import { Response } from 'express';

/**
 * Success Response Interface
 */
interface SuccessResponse<T = any> {
  status: 'success';
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

/**
 * Send success response
 */
export function sendSuccess<T = any>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
  meta?: any
): Response {
  const response: SuccessResponse<T> = {
    status: 'success',
    ...(message && { message }),
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  };

  return res.status(statusCode).json(response);
}

/**
 * Send created response (201)
 */
export function sendCreated<T = any>(res: Response, data?: T, message: string = 'Resource created successfully'): Response {
  return sendSuccess(res, data, message, 201);
}

/**
 * Send no content response (204)
 */
export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

/**
 * Send paginated response
 */
export function sendPaginated<T = any>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response {
  const totalPages = Math.ceil(total / limit);

  return sendSuccess(
    res,
    data,
    message,
    200,
    {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  );
}

/**
 * Response helper object
 */
export const response = {
  success: sendSuccess,
  created: sendCreated,
  noContent: sendNoContent,
  paginated: sendPaginated,
};

export default response;
