/**
 * @fileoverview Cache management routes
 * @description Provides REST API endpoints for cache operations and monitoring
 * @author Bilal S.
 * @version 1.0.0
 * @since 2025-07-01
 */

import { Router, Request, Response } from 'express';
import { cacheService } from '../services/cacheService';
import { queueService } from '../services/queueService';
import { asyncHandler } from '../middleware/errorHandler';

const router: Router = Router();

/**
 * @route GET /cache/status
 * @description Get cache and queue statistics
 * @returns {Object} Cache and queue status information
 * @author Bilal S.
 */
// GET /cache-status - Get cache statistics
router.get('/status', asyncHandler(async (_req: Request, res: Response) => {
  const cacheStats = cacheService.getStats();
  const queueStatus = queueService.getQueueStatus();
  
  res.json({
    cache: cacheStats,
    queue: queueStatus,
    timestamp: new Date().toISOString(),
  });
}));

// DELETE /cache - Clear entire cache
router.delete('/', asyncHandler(async (_req: Request, res: Response) => {
  cacheService.clear();
  
  res.json({
    message: 'Cache cleared successfully',
    timestamp: new Date().toISOString(),
  });
}));

export default router;
