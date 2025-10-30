// src/middleware/auth.ts
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { error } from '../utils/response';

// Shape we expect to carry in req.user (keep minimal)
export interface JwtUser {
  id: number;
  role: 'USER' | 'ADMIN';
  email?: string;
}

// Augment Express typings so req.user is recognized
declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

/**
 * authGuard
 * - Verifies Bearer token
 * - Attaches { id, role, email? } to req.user
 * - 401 on missing/invalid/expired token
 */
export function authGuard(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const match = header.match(/^Bearer (.+)$/);

  if (!match) {
    return res.status(401).json(error('UNAUTHENTICATED', 'Missing bearer token'));
  }

  try {
    const token = match[1];
    const payload = jwt.verify(token, config.jwtSecret) as any;

    // Support tokens that use either `sub` or `id`
    const idRaw = payload?.sub ?? payload?.id;
    const id = typeof idRaw === 'string' ? Number(idRaw) : Number(idRaw);

    if (!id || Number.isNaN(id)) {
      return res.status(401).json(error('UNAUTHENTICATED', 'Invalid token payload'));
    }

    const role: 'USER' | 'ADMIN' = payload?.role === 'ADMIN' ? 'ADMIN' : 'USER';

    req.user = { id, role, email: payload?.email };
    return next();
  } catch {
    return res.status(401).json(error('UNAUTHENTICATED', 'Invalid or expired token'));
  }
}

/**
 * requireRole
 * - Ensures req.user exists, and (if ADMIN) that role is ADMIN
 * - 401 if unauthenticated
 * - 403 if authenticated but lacks privileges
 */
export function requireRole(role: 'ADMIN' | 'USER') {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json(error('UNAUTHENTICATED', 'Missing bearer token'));
    }

    if (role === 'ADMIN' && user.role !== 'ADMIN') {
      return res.status(403).json(error('FORBIDDEN', 'Admin only'));
    }

    // For 'USER', being authenticated is enough
    return next();
  };
}

export default { authGuard, requireRole };
