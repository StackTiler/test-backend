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
