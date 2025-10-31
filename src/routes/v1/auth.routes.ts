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

  public authRoutesInit(app: Application) {
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
