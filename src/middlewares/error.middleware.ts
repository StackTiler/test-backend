/**
 * ============================================================================
 * Global Error Middleware
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Centralized error handling for all requests.
 * Catches exceptions from all layers and formats consistent error responses.
 *
 * ERROR HANDLING FLOW:
 * 1. Any throw error → Express error handler calls this middleware
 * 2. Check if headers already sent (prevent header errors)
 * 3. Distinguish custom errors (ErrorHandler) vs system errors
 * 4. Extract status code and message
 * 5. Log error details (for debugging/monitoring)
 * 6. Return formatted JSON response
 *
 * ERROR TYPES:
 * - Custom ErrorHandler: Business logic errors (validation, not found, etc.)
 * - System Errors: Uncaught exceptions, database errors, etc.
 *
 * LOGGING:
 * Uses LoggerUtil to log all errors with context:
 * - message: Error description
 * - statusCode: HTTP status code
 * - method: Request method (GET, POST, etc.)
 * - url: Request URL path
 * - stack: Full error stack trace
 * - context: Custom error context if available
 *
 * SECURITY:
 * - Stack trace only sent in development environment
 * - Production hides internal error details from client
 * - Prevents information disclosure attacks
 *
 * ============================================================================
 */

import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "../utils/error-handler.utills";
import { LoggerUtil } from "logger-utility-srj";
import ENV from "../config/env.config";

export const errorMiddleware = (
  err: ErrorHandler | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) return next(err);

  const isCustomError = err instanceof ErrorHandler;
  const statusCode = isCustomError ? err.statusCode : 500;
  const message = err.message || "INTERNAL_SERVER_ERROR";

  LoggerUtil.getInstance().log(
    "error",
    JSON.stringify({
      message,
      statusCode,
      method: req.method,
      url: req.originalUrl,
      stack: err.stack,
      ...(isCustomError && err.context ? { context: err.context } : {}),
    })
  );

  res.status(statusCode).json({
    success: false,
    message,
    ...(ENV.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
