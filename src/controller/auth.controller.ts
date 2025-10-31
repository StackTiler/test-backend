import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { ErrorHandler } from "../utils/error-handler.utills";

interface RequestWithUser extends Request {
  user?: { id: string };
}

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }


  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password } = req.body;

      const response = await this.authService.userRegister({
        username,
        email,
        password,
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

      const response = await this.authService.userLogin({ email, password });

      if (!response.success) {
        return next(new ErrorHandler(response.message, response.statusCode));
      }

      res.cookie("refreshToken", response.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      
      res.status(response.statusCode).json({
        success: response.success,
        message: response.message,
        statusCode: response.statusCode,
        data: {
          accessToken: response.data.accessToken,
          user: response.data.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  
  public async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken: oldRefreshToken } = req.cookies;

      if (!oldRefreshToken) {
        return next(new ErrorHandler("Refresh token required", 401));
      }

      const response = await this.authService.refreshAccessToken(oldRefreshToken);

      if (!response.success) {
        res.clearCookie("refreshToken");
        return next(new ErrorHandler(response.message, response.statusCode));
      }

      res.cookie("refreshToken", response.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

    
      res.status(response.statusCode).json({
        success: response.success,
        message: response.message,
        statusCode: response.statusCode,
        data: {
          accessToken: response.data.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }


  public async logout(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (req.user?.id) {
        await this.authService.userLogout(req.user.id);
      }

      res.clearCookie("refreshToken");

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


  public async getProfile(req: RequestWithUser, res: Response, next: NextFunction) {
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
}
