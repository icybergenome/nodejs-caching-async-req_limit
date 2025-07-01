/**
 * @fileoverview Rate limiting middleware for Express routes
 * @description Provides rate limiting functionality with proper HTTP headers
 * @author Bilal S.
 * @version 1.0.0
 * @since 2025-07-01
 */

import { Request, Response, NextFunction } from 'express';
import { rateLimiter } from '../services/rateLimiter';

/**
 * @function rateLimitMiddleware
 * @description Express middleware for rate limiting with proper headers
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 * @author Bilal S.
 */
export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const clientId = req.ip || req.socket.remoteAddress || 'unknown';
  const result = rateLimiter.checkLimit(clientId);

  // Set rate limit headers
  res.set({
    'X-RateLimit-Limit': '10',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  });

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    res.set('Retry-After', retryAfter.toString());
    
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter,
    });
    return;
  }

  next();
};
