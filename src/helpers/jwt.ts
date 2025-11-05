/**
 * ============================================================================
 * JWT Token Management Module
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * This module handles creation and verification of JWT tokens for authentication.
 * It provides both access tokens (short-lived, 15min) and refresh tokens (long-lived, 7 days).
 *
 * FLOW:
 * 1. User logs in → signAccessToken() & signRefreshToken() created
 * 2. Access token sent in Authorization header for protected routes
 * 3. Access token expires → Frontend detects 403 and calls refresh endpoint
 * 4. Refresh endpoint validates refreshToken using verifyRefreshToken()
 * 5. New tokens issued → Old tokens invalidated
 *
 * SECURITY:
 * - Access tokens are short-lived to minimize exposure if stolen
 * - Refresh tokens are long-lived but stored securely (httpOnly cookies/localStorage)
 * - Both use HS256 algorithm with environment-based secrets
 * - Token claims include user ID for request context
 *
 * ============================================================================
 */

import jwt from "jsonwebtoken";
import ENV from "../config/env.config";

const ACCESS_TOKEN_SECRET = ENV.JWT_ACCESS_SECRET || "access_secret_change_me";
const REFRESH_TOKEN_SECRET = ENV.JWT_REFRESH_SECRET || "refresh_secret_change_me";
const ACCESS_TOKEN_EXPIRES_IN = (ENV.JWT_ACCESS_EXPIRES_IN.toString() || "15m") as string;
const REFRESH_TOKEN_EXPIRES_IN = (ENV.JWT_REFRESH_EXPIRES_IN.toString() || "7d") as string;

export interface JwtPayload {
  id: string;
}

/**
 * Creates a short-lived access token (15 minutes)
 * Used for authenticating API requests
 */
export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET as jwt.Secret, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as any,
    algorithm: "HS256",
  });
};

/**
 * Creates a long-lived refresh token (7 days)
 * Stored securely and used to obtain new access tokens
 */
export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET as jwt.Secret, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as any,
    algorithm: "HS256",
  });
};

/**
 * Verifies and decodes access token
 * Throws error if token is expired or tampered with
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET as jwt.Secret) as JwtPayload;
};

/**
 * Verifies and decodes refresh token
 * Throws error if token is expired or invalid
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET as jwt.Secret) as JwtPayload;
};
