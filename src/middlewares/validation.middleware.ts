/**
 * ============================================================================
 * Input Validation Middleware (Zod)
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Validates incoming request data (body, params, query) against Zod schemas.
 * Ensures type safety and data integrity before business logic execution.
 *
 * CRITICAL ORDER FOR FILE UPLOADS:
 * 1. Route: authMiddleware → validate() → uploader → handler
 * 2. NOT: authMiddleware → uploader → validate() → handler
 *
 * When validation is AFTER uploader:
 * - Multer parses multipart data BEFORE validation runs
 * - Form fields are not available yet to validate
 * - Files consume the request stream
 *
 * When validation is BEFORE uploader:
 * - Validation happens on raw request
 * - Zod validates body fields (strings)
 * - Multer processes files after validation passes
 * - Handler receives validated data + parsed files
 *
 * VALIDATION FLOW:
 * 1. Middleware receives validation schema (Zod object)
 * 2. Parses request data (body, params, query)
 * 3. Zod validates against schema
 * 4. Type coercion happens (.transform()) for multipart string values
 * 5. If valid → Call next() → Handler executes
 * 6. If invalid → Extract error details → Return 400 with formatted errors
 *
 * ERROR RESPONSE FORMAT:
 * {
 *   "success": false,
 *   "message": "Validation failed",
 *   "errors": [
 *     { "path": "body.price", "message": "Price must be a positive number" },
 *     { "path": "params.id", "message": "Invalid MongoDB ObjectId" }
 *   ]
 * }
 *
 * TYPE COERCION FOR MULTIPART:
 * - price: "199.99" → parseFloat("199.99") → 199.99
 * - tags: "[\"tag1\", \"tag2\"]" → JSON.parse() → ["tag1", "tag2"]
 *
 * ERROR HANDLING:
 * - Zod throws ZodError on validation failure
 * - Extract error messages with path information
 * - Safe null-checking to prevent "Cannot read properties" errors
 * - Pass formatted error to ErrorHandler middleware
 *
 * ============================================================================
 */

import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { ErrorHandler } from "../utils/error-handler.utills";

export const validate = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body || {},
        query: req.query || {},
        params: req.params || {},
      });

      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        // Safely extract error messages
        const errorMessages = (error as any).errors
          .filter((err:any) => err.path && err.path.length > 0)
          .map((err:any) => ({
            path: err.path.join("."),
            message: err.message,
          }));

        // If no errors extracted, use first error message
        if (errorMessages.length === 0 && (error as any).errors.length > 0) {
          return next(
            new ErrorHandler(
              JSON.stringify({
                message: "Validation failed",
                errors: [{ path: "unknown", message: (error as any).errors[0].message }],
              }),
              400
            )
          );
        }

        return next(
          new ErrorHandler(
            JSON.stringify({
              message: "Validation failed",
              errors: errorMessages,
            }),
            400
          )
        );
      }

      next(error);
    }
  };
};
