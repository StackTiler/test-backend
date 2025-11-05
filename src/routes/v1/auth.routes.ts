/**
 * ============================================================================
 * Authentication Routes
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Defines all authentication endpoints and binds them to controller methods.
 * Specifies which routes require authentication middleware.
 *
 * ENDPOINTS:
 *
 * PUBLIC ROUTES (No authentication required):
 * - POST /v1/auth/register    → Create new user account
 * - POST /v1/auth/login       → Authenticate user, get tokens
 * - POST /v1/auth/refresh     → Get new tokens using refresh token
 *
 * PROTECTED ROUTES (Requires valid access token):
 * - POST /v1/auth/logout      → Revoke refresh token
 * - GET  /v1/auth/profile     → Get authenticated user's profile
 *
 * FLOW:
 * 1. Public route → No middleware → Handler executes immediately
 * 2. Protected route → authMiddleware validates token → Handler executes
 * 3. If token invalid/missing → 401/403 returned, handler not called
 *
 * ============================================================================
 */

import express, { Application, Router } from "express";
import { ThisContextBinder } from "../../helpers/context-binder";
import { AuthController } from "../../controller/auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

class AuthRoutes {
  private authController: AuthController;

  constructor() {
    this.authController = new AuthController();
    ThisContextBinder.bindControllerMethods(this.authController);
  }

  public authRoutesInit(app: Application): void {
    const authRoutes: Router = express.Router();

    authRoutes.post("/auth/register", this.authController.register);
    authRoutes.post("/auth/login", this.authController.login);
    authRoutes.post("/auth/refresh", this.authController.refreshToken);
    authRoutes.post("/auth/logout", authMiddleware, this.authController.logout);
    authRoutes.get("/auth/profile", authMiddleware, this.authController.getProfile);

    app.use("/v1", authRoutes);
  }
}

export default AuthRoutes;
