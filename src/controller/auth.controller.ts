/**
 * ============================================================================
 * Authentication Controller (HTTP Layer)
 *
 * WORKFLOW OVERVIEW:
 * Controller handles HTTP requests, validates input, calls service layer,
 * and returns formatted responses. Acts as bridge between HTTP and business logic.
 *
 * REQUEST/RESPONSE FLOW:
 *
 * 1. POST /v1/auth/register
 *    Request: { username, email, password, role }
 *    - Validate required fields present
 *    - Call authService.userRegister()
 *    - Return 201 Created or error
 *
 * 2. POST /v1/auth/login
 *    Request: { email, password }
 *    - Validate email and password provided
 *    - Call authService.userLogin()
 *    - Set refreshToken as httpOnly cookie (secure storage)
 *    - Return: 200 + accessToken (in body) + refreshToken (in body)
 *    - Cookie: refreshToken set for backup cookie-based sending
 *
 * 3. POST /v1/auth/refresh (No auth required)
 *    Request: { refreshToken } (from body or cookies)
 *    Flow:
 *    - Try to get token from request body first (cross-port safe)
 *    - Fallback to cookies if not in body
 *    - Call authService.refreshAccessToken()
 *    - Set new refreshToken cookie
 *    - Return: 200 + new accessToken + new refreshToken
 *
 * 4. POST /v1/auth/logout (Requires auth)
 *    Authorization: Bearer <accessToken>
 *    - Middleware validates access token
 *    - Call authService.userLogout() with user ID
 *    - Clear refreshToken cookie
 *    - Return: 200 success
 *
 * 5. GET /v1/auth/profile (Requires auth)
 *    Authorization: Bearer <accessToken>
 *    - Middleware validates access token
 *    - Call authService.getUserProfile() with user ID
 *    - Return: 200 + user profile data
 *
 * COOKIE MANAGEMENT:
 * - Set with httpOnly flag (prevent XSS access)
 * - Set with secure flag in production (HTTPS only)
 * - Set with sameSite lax (prevent CSRF attacks)
 * - maxAge: 7 days (matches refresh token expiry)
 * - path: "/" (available to all routes)
 *
 * ERROR HANDLING:
 * - All errors passed to error middleware
 * - Service layer returns error details
 * - Controller converts to HTTP status codes
 * - Client receives standardized error format
 *
 */

import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { ErrorHandler } from "../utils/error-handler.utills";
import ENV from "../config/env.config";

interface RequestWithUser extends Request {
  user?: { id: string; role: string };
}

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password, role } = req.body;

      if (!username || !email || !password) {
        return next(
          new ErrorHandler("Username, email and password are required", 400)
        );
      }

      const response = await this.authService.userRegister({
        username,
        email,
        password,
        role,
      });

      if (!response.success) {
        return next(new ErrorHandler(response.message, response.statusCode));
      }

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(
          new ErrorHandler("Email and password are required", 400)
        );
      }

      const response = await this.authService.userLogin({ email, password });

      if (!response.success) {
        return next(new ErrorHandler(response.message, response.statusCode));
      }

      const cookieOptions = this.getCookieOptions();
      res.cookie("refreshToken", response.data.refreshToken, cookieOptions);

      res.status(response.statusCode).json({
        success: response.success,
        message: response.message,
        statusCode: response.statusCode,
        data: {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          user: response.data.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      let oldRefreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

      if (!oldRefreshToken) {
        return next(new ErrorHandler("Refresh token not found", 401));
      }

      const response = await this.authService.refreshAccessToken(oldRefreshToken);

      if (!response.success) {
        res.clearCookie("refreshToken", {
          path: "/",
          sameSite: "lax",
          secure: false,
        });
        return next(new ErrorHandler(response.message, response.statusCode));
      }

      const cookieOptions = this.getCookieOptions();
      res.cookie("refreshToken", response.data.refreshToken, cookieOptions);

      res.status(response.statusCode).json({
        success: response.success,
        message: response.message,
        statusCode: response.statusCode,
        data: {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async logout(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (req.user?.id) {
        await this.authService.userLogout(req.user.id);
      }

      res.clearCookie("refreshToken", {
        path: "/",
        sameSite: "lax",
        secure: false,
      });

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
        statusCode: 200,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getProfile(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user?.id) {
        return next(new ErrorHandler("Unauthorized", 401));
      }

      const response = await this.authService.getUserProfile(req.user.id);

      if (!response.success) {
        return next(new ErrorHandler(response.message, response.statusCode));
      }

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  private getCookieOptions(): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax" | "strict" | "none";
    maxAge: number;
    path: string;
  } {
    const isDevelopment = ENV.NODE_ENV !== "production";

    return {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: isDevelopment ? "lax" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    };
  }
}
