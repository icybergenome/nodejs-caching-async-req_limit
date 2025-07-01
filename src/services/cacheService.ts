/**
 * @fileoverview LRU Cache implementation with TTL and statistics tracking
 * @description Provides an in-memory LRU cache with automatic expiration and performance monitoring
 * @author Bilal S.
 * @version 1.0.0
 * @since 2025-07-01
 */

import { User } from '../types';

/**
 * @interface CacheItem
 * @description Represents a cached item with metadata
 */
interface CacheItem {
  data: User;
  timestamp: number;
  accessTime: number;
}

/**
 * @interface CacheStats
 * @description Statistics for cache performance monitoring
 */
interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  totalRequests: number;
  averageResponseTime: number;
  totalResponseTime: number;
}

/**
 * @class LRUCache
 * @description Least Recently Used cache implementation with Time-To-Live (TTL) support
 * @author Bilal S.
 */
export class LRUCache {
  private cache = new Map<string, CacheItem>();
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live in milliseconds
  private cleanupInterval: NodeJS.Timeout | null = null;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    totalRequests: 0,
    averageResponseTime: 0,
    totalResponseTime: 0,
  };

  /**
   * @constructor
   * @description Initializes the LRU cache with specified configuration
   * @param {number} maxSize - Maximum number of items to store (default: 100)
   * @param {number} ttlSeconds - Time to live in seconds (default: 60)
   * @author Bilal S.
   */
  constructor(maxSize = 100, ttlSeconds = 60) {
    this.maxSize = maxSize;
    this.ttl = ttlSeconds * 1000; // Convert to milliseconds
    
    // Start background cleanup task only in non-test environment
    if (process.env['NODE_ENV'] !== 'test') {
      this.startCleanupTask();
    }
  }

  /**
   * @method get
   * @description Retrieves an item from the cache with LRU update
   * @param {string} key - The cache key to retrieve
   * @returns {User | null} The cached user data or null if not found/expired
   * @author Bilal S.
   */
  get(key: string): User | null {
    const startTime = Date.now();
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      this.updateStats(startTime);
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.size--;
      this.stats.misses++;
      this.updateStats(startTime);
      return null;
    }

    // Update access time for LRU
    item.accessTime = Date.now();
    
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    
    this.stats.hits++;
    this.updateStats(startTime);
    return item.data;
  }

  /**
   * @method set
   * @description Stores an item in the cache with LRU management
   * @param {string} key - The cache key to store under
   * @param {User} data - The user data to cache
   * @returns {void}
   * @author Bilal S.
   */
  set(key: string, data: User): void {
    const now = Date.now();
    
    // If key exists, just update it
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used item
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.stats.size--;
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      accessTime: now,
    });
    
    if (!this.cache.has(key) || this.cache.size < this.maxSize) {
      this.stats.size++;
    }
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size--;
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  destroy(): void {
    this.clear();
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private updateStats(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.stats.totalRequests++;
    this.stats.totalResponseTime += responseTime;
    this.stats.averageResponseTime = this.stats.totalResponseTime / this.stats.totalRequests;
  }

  private startCleanupTask(): void {
    // Run cleanup every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 30000);
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.stats.size--;
    });
  }
}

export const cacheService = new LRUCache();
