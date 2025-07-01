/**
 * @fileoverview Error handling middleware for Express application
 * @description Provides centralized error handling with proper HTTP responses
 * @author Bilal S.
 * @version 1.0.0
 * @since 2025-07-01
 */

import { Request, Response, NextFunction } from 'express';

/**
 * @interface ApiError
 * @description Extended Error interface for API error handling
 */
export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * @function errorHandler
 * @description Express error handling middleware
 * @param {ApiError} err - The error object
 * @param {Request} _req - Express request object (unused)
 * @param {Response} res - Express response object
 * @param {NextFunction} _next - Express next function (unused)
 * @returns {void}
 * @author Bilal S.
 */
export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const { statusCode = 500, message, stack } = err;

  const response = {
    error: {
      message,
      ...(process.env['NODE_ENV'] === 'development' && { stack }),
    },
  };

  console.error(`Error ${statusCode}: ${message}`);
  if (process.env['NODE_ENV'] === 'development') {
    console.error(stack);
  }

  res.status(statusCode).json(response);
};

/**
 * @function notFoundHandler
 * @description Middleware for handling 404 errors
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {void}
 * @author Bilal S.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      message: `Route ${req.originalUrl} not found`,
    },
  });
};

/**
 * @function asyncHandler
 * @description Wrapper for async route handlers to catch errors
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 * @author Bilal S.
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
