/**
 * ============================================================================
 * Authentication Middleware
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * This middleware protects routes by verifying JWT access tokens
 * on every request before allowing handler execution.
 *
 * FLOW:
 * 1. Client sends request with Authorization: Bearer <token>
 * 2. Middleware extracts token from header
 * 3. Token is verified using verifyAccessToken()
 * 4. If valid: Extract user ID and attach to request object
 * 5. If invalid/expired: Return 401/403 error
 * 6. Handler executes with authenticated user context
 *
 * ERROR HANDLING:
 * - 401 No Token: Request missing authorization header
 * - 403 Token Expired: Token exists but is expired → Frontend should refresh
 * - 403 Invalid Token: Token tampered or signature invalid
 *
 * USAGE:
 * app.get('/protected-route', authMiddleware, handler)
 *
 * ============================================================================
 */

import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../helpers/jwt";
import { ErrorHandler } from "../utils/error-handler.utills";

interface RequestWithUser extends Request {
  user?: { id: string };
}

export const authMiddleware = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next(new ErrorHandler("Access token required", 401));
    }

    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id };
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Access token expired", 403));
    }

    return next(new ErrorHandler("Invalid access token", 403));
  }
};
