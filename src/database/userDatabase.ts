/**
 * @fileoverview Mock user database with simulated delay
 * @description Provides a simple in-memory user database for testing and development
 * @author Bilal S.
 * @version 1.0.0
 * @since 2025-07-01
 */

import { User } from '../types';

/**
 * @function delay
 * @description Creates a delay for simulating database operations
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>} Promise that resolves after the delay
 * @author Bilal S.
 */
const delay = (ms: number): Promise<void> => 
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @constant mockUsers
 * @description Initial user data for the mock database
 * @author Bilal S.
 */
export const mockUsers: Record<number, User> = {
  1: { id: 1, name: 'John Doe', email: 'john@example.com' },
  2: { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  3: { id: 3, name: 'Alice Johnson', email: 'alice@example.com' },
};

/**
 * @class UserDatabase
 * @description Singleton mock database for user management with simulated delays
 * @author Bilal S.
 */
export class UserDatabase {
  private static instance: UserDatabase;
  private users: Record<number, User> = { ...mockUsers };
  private nextId = 4;

  /**
   * @method getInstance
   * @description Gets the singleton instance of UserDatabase
   * @returns {UserDatabase} The singleton database instance
   * @author Bilal S.
   */
  static getInstance(): UserDatabase {
    if (!UserDatabase.instance) {
      UserDatabase.instance = new UserDatabase();
    }
    return UserDatabase.instance;
  }

  /**
   * @method getUserById
   * @description Retrieves a user by ID with simulated database delay
   * @param {number} id - The user ID to retrieve
   * @returns {Promise<User | null>} The user data or null if not found
   * @author Bilal S.
   */
  async getUserById(id: number): Promise<User | null> {
    // Simulate database delay
    await delay(parseInt(process.env['DB_DELAY_MS'] || '200', 10));

    return this.users[id] || null;
  }

  /**
   * @method createUser
   * @description Creates a new user with simulated database delay
   * @param {Omit<User, 'id'>} userData - User data without ID
   * @returns {Promise<User>} The created user with assigned ID
   * @author Bilal S.
   */
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    // Simulate database delay
    await delay(parseInt(process.env['DB_DELAY_MS'] || '200', 10));

    const newUser: User = {
      id: this.nextId++,
      ...userData,
    };

    this.users[newUser.id] = newUser;
    return newUser;
  }

  getAllUsers(): User[] {
    return Object.values(this.users);
  }
}
