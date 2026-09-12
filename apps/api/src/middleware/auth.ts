import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthError } from '../utils/errors';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.access_token;
  
  let token = cookieToken;
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(new AuthError('No token provided'));
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as {
      sub: string;
      username: string;
      email: string;
      role: string;
    };
    req.user = {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    next(new AuthError('Invalid or expired token', 'TOKEN_INVALID'));
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.access_token;
  
  let token = cookieToken;
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(); // No token → continue unauthenticated
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as {
      sub: string;
      username: string;
      email: string;
      role: string;
    };
    req.user = {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    // Invalid token → ignore and continue unauthenticated
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthError('Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AuthError('Insufficient permissions', 'FORBIDDEN'));
    }
    next();
  };
}
