import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from "../config/logger";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateJWT: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.warn('No token provided in request');
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      logger.warn('Invalid token');
      res.status(403).json({ error: 'Invalid token' });
      return;
    }
    if (typeof user === 'object' && user !== null && 'id' in user) {
      logger.info(`Authenticated user: ${(user as any).id}`);
    } else {
      logger.info(`Authenticated user: unknown`);
    }
    (req as AuthRequest).user = user;
    next();
  });
};

export const authorizeRoles = (...roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const user = (req as AuthRequest).user;
    if (!user || !roles.includes(user.role)) {
      logger.warn(`Forbidden access for user: ${user?.id}, role: ${user?.role}`);
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    logger.info(`Authorized user: ${user.id}, role: ${user.role}`);
    next();
  };
};
