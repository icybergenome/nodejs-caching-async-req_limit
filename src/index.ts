/**
 * @fileoverview Main server entry point for the User Data API
 * @description This file initializes the Express server with graceful shutdown handling
 * @author Bilal S.
 * @version 1.0.0
 * @since 2025-07-01
 */

import app from './app';

/**
 * @description Server port configuration from environment variables
 * @default 8000 - Default port if PORT environment variable is not set
 */
const PORT = parseInt(process.env['PORT'] || '8000', 10);

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 API Health Report: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env['NODE_ENV'] || 'development'}`);
});

// Graceful shutdown
/**
 * @description Handles graceful server shutdown when receiving termination signals
 * @param {string} signal - The signal received (SIGTERM, SIGINT, etc.)
 * @returns {void}
 * @author Bilal S.
 */
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('Server closed successfully');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
