/**
 * =============================================================================
 * AUTHENTICATION MIDDLEWARE
 * =============================================================================
 * JWT-based authentication and role-based authorization
 * =============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { prisma } from '../db';
import { UserRole } from '@prisma/client';

/**
 * Extended Request interface with user
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

/**
 * JWT Payload Interface
 */
interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Verify JWT token and attach user to request
 */
export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
}

/**
 * Authorize user based on roles
 * @param allowedRoles - Array of allowed roles
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}

/**
 * Check if user has access to a specific store
 */
export async function checkStoreAccess(userId: string, storeId: string, permission: 'view' | 'edit' | 'delete' | 'approve' = 'view'): Promise<boolean> {
  const access = await prisma.storeAccess.findUnique({
    where: {
      userId_storeId: {
        userId,
        storeId,
      },
    },
  });

  if (!access) {
    return false;
  }

  switch (permission) {
    case 'view':
      return access.canView;
    case 'edit':
      return access.canEdit;
    case 'delete':
      return access.canDelete;
    case 'approve':
      return access.canApprove;
    default:
      return false;
  }
}

/**
 * Middleware to check store access
 */
export function requireStoreAccess(permission: 'view' | 'edit' | 'delete' | 'approve' = 'view') {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Owner and HQ Admin have access to all stores
      if (req.user.role === 'OWNER' || req.user.role === 'HQ_ADMIN') {
        return next();
      }

      // Get store ID from params or body
      const storeId = req.params.storeId || req.body.storeId;
      if (!storeId) {
        throw new ForbiddenError('Store ID required');
      }

      const hasAccess = await checkStoreAccess(req.user.id, storeId, permission);
      if (!hasAccess) {
        throw new ForbiddenError('No access to this store');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Optional authentication - attaches user if token is valid, but doesn't require it
 */
export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
}
