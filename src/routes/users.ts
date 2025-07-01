/**
 * @fileoverview User routes with caching and queue management
 * @description Provides REST API endpoints for user operations with caching
 * @author Bilal S.
 * @version 1.0.0
 * @since 2025-07-01
 */

import { Router, Request, Response } from 'express';
import { cacheService } from '../services/cacheService';
import { queueService } from '../services/queueService';
import { UserDatabase } from '../database/userDatabase';
import { asyncHandler } from '../middleware/errorHandler';
import { User } from '../types';

const router: Router = Router();

/**
 * @route GET /users/:id
 * @description Get user by ID with caching support
 * @param {string} id - User ID parameter
 * @returns {Object} User data with cache status
 * @author Bilal S.
 */
// GET /users/:id - Get user by ID with caching
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params['id'] || '0', 10);
  
  if (isNaN(userId) || userId <= 0) {
    res.status(400).json({
      error: 'Invalid user ID. Please provide a valid positive integer.',
    });
    return;
  }

  const cacheKey = `user:${userId}`;
  
  // Try to get from cache first
  let user = cacheService.get(cacheKey);
  
  if (user) {
    res.json({
      data: user,
      cached: true,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // If not in cache, use queue service to fetch
  user = await queueService.addUserFetchJob(userId);
  
  if (!user) {
    res.status(404).json({
      error: 'User not found',
      message: `User with ID ${userId} does not exist.`,
    });
    return;
  }

  // Cache the result
  cacheService.set(cacheKey, user);
  
  res.json({
    data: user,
    cached: false,
    timestamp: new Date().toISOString(),
  });
}));

// POST /users - Create new user
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    res.status(400).json({
      error: 'Missing required fields',
      message: 'Both name and email are required.',
    });
    return;
  }

  if (typeof name !== 'string' || typeof email !== 'string') {
    res.status(400).json({
      error: 'Invalid field types',
      message: 'Name and email must be strings.',
    });
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      error: 'Invalid email format',
      message: 'Please provide a valid email address.',
    });
    return;
  }

  const userDb = UserDatabase.getInstance();
  const newUser: User = await userDb.createUser({ name, email });
  
  // Cache the new user
  const cacheKey = `user:${newUser.id}`;
  cacheService.set(cacheKey, newUser);
  
  res.status(201).json({
    data: newUser,
    message: 'User created successfully',
    timestamp: new Date().toISOString(),
  });
}));

export default router;
