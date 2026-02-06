/**
 * ============================================================================
 * Authentication Service (Business Logic Layer)
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Service layer contains all authentication business logic.
 * Validates input, enforces business rules, orchestrates operations.
 *
 * COMPLETE AUTH FLOW:
 *
 * 1. USER REGISTRATION:
 *    - Validate email format
 *    - Check if user already exists
 *    - Validate password strength (min 6 chars)
 *    - Create user (password auto-hashed by schema)
 *    - Return success message
 *
 * 2. USER LOGIN:
 *    - Validate email and password provided
 *    - Find user by email (with password hash)
 *    - Check if account is active
 *    - Compare provided password with stored hash
 *    - Create access token (15 min) + refresh token (7 days)
 *    - Store refresh token in database
 *    - Return tokens + user info
 *
 * 3. TOKEN REFRESH:
 *    - Receive refresh token from client
 *    - Verify token signature and expiration
 *    - Check if token exists in database (not revoked)
 *    - Verify token belongs to correct user (prevent token hijacking)
 *    - Generate new access token + new refresh token (token rotation)
 *    - Store new refresh token, invalidate old one
 *    - Return new tokens
 *
 * 4. USER LOGOUT:
 *    - Receive user ID from authenticated request
 *    - Remove refresh token from database (revocation)
 *    - Client also clears localStorage tokens
 *    - Result: User must re-login for new tokens
 *
 * 5. GET PROFILE:
 *    - Receive user ID from authenticated request
 *    - Fetch user details (excluding sensitive fields)
 *    - Return user profile information
 *
 * ERROR HANDLING:
 * - Input validation errors return 400 (Bad Request)
 * - Conflict errors return 409 (User exists)
 * - Auth failures return 401/403 (Unauthorized/Forbidden)
 * - Server errors return 500 (Internal Server Error)
 *
 * SECURITY NOTES:
 * - Passwords never logged or returned
 * - Token rotation on refresh (old token invalid)
 * - Database token validation prevents replay attacks
 * - lastLogin tracks user activity for auditing
 *
 * ============================================================================
 */

import { ResponseMessage } from "response-messages";
import { AuthRepository } from "../repositories/auth.repository";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../helpers/jwt";

interface UserInfo {
  email: string;
  password: string;
}

interface RegisterInfo {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  public async userRegister(payload: RegisterInfo) {
    try {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(payload.email)) {
        return ResponseMessage.badRequest("Invalid email format");
      }

      const userExists = await this.authRepository.existsByEmail(payload.email);
      if (userExists) {
        return ResponseMessage.conflict("User already exists with this email");
      }

      if (payload.password.length < 6) {
        return ResponseMessage.badRequest("Password must be at least 6 characters");
      }

      await this.authRepository.create({
        username: payload.username.trim(),
        email: payload.email.toLowerCase().trim(),
        password: payload.password,
        role: (payload.role as "admin" | "moderator" | "user") || "user",
        isActive: true,
      } as any);

      return ResponseMessage.created("User registered successfully", {
        message: "Please login with your credentials",
      });
    } catch (error: any) {
      return ResponseMessage.internalServerError(
        error.message || "Registration failed"
      );
    }
  }

  public async userLogin(payload: UserInfo) {
    try {
      if (!payload.email || !payload.password) {
        return ResponseMessage.badRequest("Email and password are required");
      }

      const existingUser = await this.authRepository.findByEmailWithPassword(
        payload.email.toLowerCase().trim()
      );

      if (!existingUser) {
        return ResponseMessage.unauthorized("Invalid email or password");
      }

      if (!existingUser.isActive) {
        return ResponseMessage.forbidden("Account is deactivated");
      }

      const isPasswordMatch = await existingUser.comparePassword(payload.password);
      if (!isPasswordMatch) {
        return ResponseMessage.unauthorized("Invalid email or password");
      }

      const userPayload = {
        id: existingUser._id.toString(),
      };

      const accessToken = signAccessToken(userPayload);
      const refreshToken = signRefreshToken(userPayload);

      await this.authRepository.storeRefreshToken(
        existingUser._id.toString(),
        refreshToken
      );

      return ResponseMessage.ok("Login successful", {
        accessToken,
        refreshToken,
        user: {
          id: existingUser._id.toString(),
          username: existingUser.username,
          email: existingUser.email,
          role: existingUser.role,
        },
      });
    } catch (error: any) {
      return ResponseMessage.internalServerError(error.message || "Login failed");
    }
  }

  public async refreshAccessToken(oldRefreshToken: string) {
    try {
      const decoded: any = verifyRefreshToken(oldRefreshToken);

      if (!decoded || !decoded.id) {
        return ResponseMessage.unauthorized("Invalid refresh token");
      }

      const user = await this.authRepository.findByRefreshToken(oldRefreshToken);

      if (!user) {
        return ResponseMessage.unauthorized(
          "Invalid refresh token or user inactive"
        );
      }

      if (user._id.toString() !== decoded.id) {
        return ResponseMessage.unauthorized("Token mismatch");
      }

      const userPayload = {
        id: user._id.toString(),
      };

      const newAccessToken = signAccessToken(userPayload);
      const newRefreshToken = signRefreshToken(userPayload);

      await this.authRepository.storeRefreshToken(
        user._id.toString(),
        newRefreshToken
      );

      return ResponseMessage.ok("Token refreshed successfully", {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error: any) {
      return ResponseMessage.unauthorized(
        "Invalid or expired refresh token"
      );
    }
  }

  public async userLogout(userId: string) {
    try {
      await this.authRepository.clearRefreshToken(userId);
      return ResponseMessage.ok("Logged out successfully", null);
    } catch (error: any) {
      return ResponseMessage.internalServerError(
        error.message || "Logout failed"
      );
    }
  }

  public async getUserProfile(userId: string) {
    try {
      const user = await this.authRepository.findByIdActive(userId);

      if (!user) {
        return ResponseMessage.notFound("User not found");
      }

      return ResponseMessage.ok("Profile retrieved successfully", {
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error: any) {
      return ResponseMessage.internalServerError(
       "Failed to retrieve profile"
      );
    }
  }
}
