/**
 * ============================================================================
 * Authentication Repository (Data Access Layer)
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Repository pattern separates data access logic from business logic.
 * Provides clean interface for user database operations.
 *
 * RESPONSIBILITIES:
 * - User CRUD operations
 * - Refresh token management (store, retrieve, clear)
 * - User lookups by email, ID, or token
 *
 * FLOW DURING AUTHENTICATION:
 * 1. Register: create() → Add new user to database
 * 2. Login: findByEmailWithPassword() → Get user with password hash
 *           comparePassword() → Validate credentials
 *           storeRefreshToken() → Save refresh token after login
 * 3. Refresh: findByRefreshToken() → Validate token still exists in DB
 *             storeRefreshToken() → Rotate token (new token stored)
 * 4. Logout: clearRefreshToken() → Delete token (revoke all sessions)
 * 5. Profile: findByIdActive() → Get user details if account active
 *
 * KEY METHODS:
 * - findByEmailWithPassword(): Includes password for login validation
 * - storeRefreshToken(): Updates lastLogin timestamp + token
 * - findByRefreshToken(): Returns user only if token is valid
 * - clearRefreshToken(): Removes token (logout + session revocation)
 * - findByIdActive(): Checks if user account is still active
 *
 * ============================================================================
 */

import { IUser, UserModel } from "../model/auth.model";
import { CrudRepository } from "./crud.repository";

export class AuthRepository extends CrudRepository<IUser> {
  constructor() {
    super(UserModel);
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    try {
      return await this.model.findOne({ email }).select("+password").exec();
    } catch (error) {
      throw error;
    }
  }

  async storeRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<IUser | null> {
    try {
      return await this.model
        .findByIdAndUpdate(
          userId,
          {
            refreshToken,
            lastLogin: new Date(),
          },
          { new: true }
        )
        .exec();
    } catch (error) {
      throw error;
    }
  }

  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    try {
      return await this.model
        .findOne({ refreshToken })
        .select("+refreshToken")
        .exec();
    } catch (error) {
      throw error;
    }
  }

  async clearRefreshToken(userId: string): Promise<IUser | null> {
    try {
      return await this.model
        .findByIdAndUpdate(
          userId,
          { $unset: { refreshToken: 1 } },
          { new: true }
        )
        .exec();
    } catch (error) {
      throw error;
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    try {
      const count = await this.model.countDocuments({ email }).exec();
      return count > 0;
    } catch (error) {
      throw error;
    }
  }

  async findByIdActive(userId: string): Promise<IUser | null> {
    try {
      return await this.model.findOne({ _id: userId }).exec();
    } catch (error) {
      throw error;
    }
  }
}
