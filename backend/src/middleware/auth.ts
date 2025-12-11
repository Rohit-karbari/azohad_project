import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../logging';

export interface AuthPayload {
  id: string;
  email: string;
  type: 'patient' | 'doctor'; // RBAC role
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
  correlationId?: string;
}

export function generateToken(payload: AuthPayload): string {
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRY || '24h',
  } as any);
}

export function verifyToken(token: string): AuthPayload {
  try {
    const secret = process.env.JWT_SECRET || 'secret';
    return jwt.verify(token, secret) as AuthPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const token = (req as any).headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ code: 'MISSING_TOKEN', message: 'Missing authentication token' });
      return;
    }

    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: (error as Error).message,
      path: (req as any).path,
    });
    res.status(401).json({ code: 'INVALID_TOKEN', message: 'Invalid authentication token' });
  }
}

export function rbacMiddleware(allowedRoles: ('patient' | 'doctor')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ code: 'MISSING_AUTH', message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.type)) {
      logger.warn('Unauthorized access attempt', {
        user: req.user.id,
        userType: req.user.type,
        allowedRoles,
        path: (req as any).path,
      });
      res.status(403).json({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
