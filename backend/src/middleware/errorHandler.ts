import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error factories
export const Errors = {
  unauthorized: (message = 'Unauthorized') => new AppError(message, 401, 'UNAUTHORIZED'),
  forbidden: (message = 'Access denied') => new AppError(message, 403, 'FORBIDDEN'),
  notFound: (resource = 'Resource') => new AppError(`${resource} not found`, 404, 'NOT_FOUND'),
  conflict: (message: string) => new AppError(message, 409, 'CONFLICT'),
  badRequest: (message: string) => new AppError(message, 400, 'BAD_REQUEST'),
  internal: (message = 'Internal server error') => new AppError(message, 500, 'INTERNAL_ERROR', false),
};

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // Known operational errors (handles both instanceof and cross-module duck typing)
  const isOperational = err instanceof AppError || ('statusCode' in err && 'code' in err);
  if (isOperational) {
    const statusCode = (err as any).statusCode || 500;
    const code = (err as any).code || 'INTERNAL_ERROR';
    if (!(err as any).isOperational && statusCode === 500) {
      logger.error('Non-operational error', { error: err.message, stack: err.stack });
    }
    res.status(statusCode).json({
      success: false,
      message: err.message,
      code,
    });
    return;
  }

  // Unknown errors — log full details
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
  });
}
