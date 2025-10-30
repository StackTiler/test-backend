"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const error_handler_utills_1 = require("../utils/error-handler.utills");
const logger_utility_srj_1 = require("logger-utility-srj");
const errorMiddleware = (err, req, res, next) => {
    if (res.headersSent)
        return next(err);
    const isCustomError = err instanceof error_handler_utills_1.ErrorHandler;
    const statusCode = isCustomError ? err.statusCode : 500;
    const message = err.message || "INTERNAL_SERVER_ERROR";
    logger_utility_srj_1.LoggerUtil.getInstance().log("error", JSON.stringify({
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
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};
exports.errorMiddleware = errorMiddleware;
