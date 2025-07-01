/**
 * @fileoverview Express application configuration and middleware setup
 * @description Configures the Express app with security, routing, and error handling middleware
 * @author Bilal S.
 * @version 1.0.0
 * @since 2025-07-01
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { rateLimitMiddleware } from './middleware/rateLimitMiddleware';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import userRoutes from './routes/users';
import cacheRoutes from './routes/cache';

// Load environment variables
dotenv.config();

/**
 * @description Express application instance with configured middleware
 * @author Bilal S.
 */
const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || '*',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware (skip in test environment)
if (process.env['NODE_ENV'] !== 'test') {
  app.use(rateLimitMiddleware);
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// API routes
app.use('/users', userRoutes);
app.use('/cache', cacheRoutes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
