import { Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@agentflow/shared';
import { verifyAccessToken } from '../lib/jwt.js';
import { AppError } from './error.middleware.js';
import type { Request } from 'express';

/**
 * Authentication middleware to verify JWT access token.
 * Populates req.user and req.orgId.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token missing or invalid', HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    req.user = payload;
    req.orgId = payload.orgId;

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new AppError('Authentication token expired', HTTP_STATUS.UNAUTHORIZED));
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid authentication token', HTTP_STATUS.UNAUTHORIZED));
      return;
    }
    next(error);
  }
}

/**
 * Role authorization guard.
 * Must be used after authenticate middleware.
 */
export function requireRole(roles: string | string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError('Forbidden: Access denied', HTTP_STATUS.FORBIDDEN));
      return;
    }

    next();
  };
}

/**
 * Organization membership guard.
 * Verifies that the user belongs to the requested organization.
 */
export function requireOrg(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED));
    return;
  }

  if (!req.orgId) {
    next(new AppError('No organization context selected', HTTP_STATUS.BAD_REQUEST));
    return;
  }

  next();
}
