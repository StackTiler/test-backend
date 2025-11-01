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

  LoggerUtil.getInstance().log("error", JSON.stringify({
    message,
    statusCode,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
    ...(isCustomError && err.context ? { context: err.context } : {})
  }));

  res.status(statusCode).json({
    success: false,
    message,
    ...(ENV.NODE_ENV !== "production" && { stack: err.stack }),
  });
};