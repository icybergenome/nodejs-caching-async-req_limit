/**
 * @fileoverview Queue service for managing asynchronous user fetch operations
 * @description Implements a job queue system with deduplication and concurrent request handling
 * @author Bilal S.
 * @version 1.0.0
 * @since 2025-07-01
 */

import { User } from '../types';
import { UserDatabase } from '../database/userDatabase';

/**
 * @interface QueueJob
 * @description Represents a queued job for fetching user data
 */
interface QueueJob {
  id: string;
  userId: number;
  timestamp: number;
  resolve: (value: User | null) => void;
  reject: (reason?: Error) => void;
}

/**
 * @class QueueService
 * @description Manages asynchronous user fetch operations with request deduplication
 * @author Bilal S.
 */
export class QueueService {
  private queue: QueueJob[] = [];
  private processing = false;
  private pendingRequests = new Map<number, Promise<User | null>>();
  private stats = {
    processed: 0,
    failed: 0,
    pending: 0,
  };

  /**
   * @method addUserFetchJob
   * @description Adds a user fetch job to the queue with deduplication
   * @param {number} userId - The ID of the user to fetch
   * @returns {Promise<User | null>} Promise resolving to user data or null
   * @author Bilal S.
   */
  async addUserFetchJob(userId: number): Promise<User | null> {
    // Check if there's already a pending request for this user
    if (this.pendingRequests.has(userId)) {
      return this.pendingRequests.get(userId)!;
    }

    // Create a promise for this request
    const promise = new Promise<User | null>((resolve, reject) => {
      const job: QueueJob = {
        id: `user-${userId}-${Date.now()}`,
        userId,
        timestamp: Date.now(),
        resolve,
        reject,
      };

      this.queue.push(job);
      this.stats.pending++;
      
      // Start processing if not already processing
      if (!this.processing) {
        this.processQueue();
      }
    });

    this.pendingRequests.set(userId, promise);
    return promise;
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) continue;

      this.stats.pending--;

      try {
        const userDb = UserDatabase.getInstance();
        const user = await userDb.getUserById(job.userId);
        
        job.resolve(user);
        this.stats.processed++;
        this.pendingRequests.delete(job.userId);
      } catch (error) {
        job.reject(error instanceof Error ? error : new Error('Unknown error'));
        this.stats.failed++;
        this.pendingRequests.delete(job.userId);
      }

      // Add small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.processing = false;
  }

  getQueueStatus() {
    return {
      waiting: this.queue.length,
      processing: this.processing,
      pendingRequests: this.pendingRequests.size,
      stats: { ...this.stats },
    };
  }

  async close(): Promise<void> {
    // Clear pending requests
    this.queue.forEach(job => {
      job.reject(new Error('Queue service is shutting down'));
    });
    this.queue = [];
    this.pendingRequests.clear();
  }
}

export const queueService = new QueueService();
