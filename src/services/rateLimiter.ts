/**
 * @fileoverview Rate limiting service with burst and sustained traffic handling
 * @description Implements a dual-layer rate limiting system for API protection
 * @author Bilal S.
 * @version 1.0.0
 * @since 2025-07-01
 */

/**
 * @interface RateLimitEntry
 * @description Tracks request timestamps for a specific client
 */
interface RateLimitEntry {
  requests: number[];
  burstRequests: number[];
}

/**
 * @class RateLimiter
 * @description Dual-layer rate limiter with burst and sustained traffic limits
 * @author Bilal S.
 */
export class RateLimiter {
  private clients = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly burstWindowMs: number;
  private readonly maxBurstRequests: number;

  /**
   * @constructor
   * @description Initializes the rate limiter with dual-layer configuration
   * @param {number} maxRequests - Maximum requests per window (default: 10)
   * @param {number} windowMs - Window duration in milliseconds (default: 60000)
   * @param {number} maxBurstRequests - Maximum burst requests (default: 5)
   * @param {number} burstWindowMs - Burst window duration in milliseconds (default: 10000)
   * @author Bilal S.
   */
  constructor(
    maxRequests = 10, // 10 requests per minute
    windowMs = 60 * 1000, // 1 minute
    maxBurstRequests = 5, // 5 requests in burst window
    burstWindowMs = 10 * 1000 // 10 seconds
  ) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.maxBurstRequests = maxBurstRequests;
    this.burstWindowMs = burstWindowMs;

    // Clean up old entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * @method checkLimit
   * @description Checks if a client has exceeded rate limits
   * @param {string} clientId - Unique identifier for the client (usually IP address)
   * @returns {{allowed: boolean, remaining: number, resetTime: number}} Rate limit result
   * @author Bilal S.
   */
  checkLimit(clientId: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    
    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, {
        requests: [],
        burstRequests: [],
      });
    }

    const client = this.clients.get(clientId)!;

    // Remove old requests outside the window
    client.requests = client.requests.filter(time => now - time < this.windowMs);
    client.burstRequests = client.burstRequests.filter(time => now - time < this.burstWindowMs);

    // Check burst limit first
    if (client.burstRequests.length >= this.maxBurstRequests) {
      const oldestBurstRequest = Math.min(...client.burstRequests);
      const burstResetTime = oldestBurstRequest + this.burstWindowMs;
      return {
        allowed: false,
        remaining: 0,
        resetTime: burstResetTime,
      };
    }

    // Check regular limit
    if (client.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...client.requests);
      const resetTime = oldestRequest + this.windowMs;
      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }

    // Allow the request
    client.requests.push(now);
    client.burstRequests.push(now);

    const remaining = Math.min(
      this.maxRequests - client.requests.length,
      this.maxBurstRequests - client.burstRequests.length
    );

    return {
      allowed: true,
      remaining,
      resetTime: now + this.windowMs,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const clientsToDelete: string[] = [];

    for (const [clientId, client] of this.clients.entries()) {
      // Remove old requests
      client.requests = client.requests.filter(time => now - time < this.windowMs);
      client.burstRequests = client.burstRequests.filter(time => now - time < this.burstWindowMs);

      // If no recent requests, remove the client
      if (client.requests.length === 0 && client.burstRequests.length === 0) {
        clientsToDelete.push(clientId);
      }
    }

    clientsToDelete.forEach(clientId => {
      this.clients.delete(clientId);
    });
  }

  getStats() {
    return {
      totalClients: this.clients.size,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs,
      maxBurstRequests: this.maxBurstRequests,
      burstWindowMs: this.burstWindowMs,
    };
  }
}

export const rateLimiter = new RateLimiter();
