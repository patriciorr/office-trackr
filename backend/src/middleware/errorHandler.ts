import {Request, Response, NextFunction} from 'express';
import {logger} from '../config/logger';
import {AppError} from '../utils/AppError';

export function errorHandler(err: Error | AppError, req: Request, res: Response, next: NextFunction) {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    logger.error(err.stack);
  }

  const status = err instanceof AppError ? err.statusCode : 500;
  const isOperational = err instanceof AppError ? err.isOperational : false;

  const response = {
    error: err.message,
    ...(process.env.NODE_ENV !== 'production' && err.stack ? {stack: err.stack} : {}),
    isOperational,
  };
  res.status(status).json(response);
}
