/**
 * @fileoverview Type definitions for the User Data API
 * @description Contains all TypeScript interfaces and types used throughout the application
 * @author Bilal S.
 * @version 1.0.0
 * @since 2025-07-01
 */

/**
 * @interface User
 * @description Represents a user entity in the system
 */
export interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * @interface CacheEntry
 * @description Generic cache entry with metadata
 * @template T - The type of data being cached
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessTime: number;
}

/**
 * @interface CacheStats
 * @description Statistics for cache performance monitoring
 */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  averageResponseTime: number;
  totalRequests: number;
  totalResponseTime: number;
}

/**
 * @interface RateLimitState
 * @description State information for rate limiting
 */
export interface RateLimitState {
  count: number;
  resetTime: number;
  burstCount: number;
  burstResetTime: number;
}

/**
 * @interface ApiResponse
 * @description Generic API response structure
 * @template T - The type of data in the response
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
