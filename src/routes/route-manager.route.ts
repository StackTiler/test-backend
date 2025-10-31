import express, { Application, NextFunction, Request, Response } from "express";
import { errorMiddleware } from "../middlewares/error.middleware";
import GarmentsRoutes from "./v1/garments.routes";
import AuthRoutes from "./v1/auth.routes";

class RouteManager {
    private static instance: RouteManager;
    private garmentsRoutes: GarmentsRoutes;
    private authRoutes: AuthRoutes;

    private constructor() {
        this.authRoutes = new AuthRoutes();
        this.garmentsRoutes = new GarmentsRoutes();
    }

    public static getInstance(): RouteManager {
        if (!RouteManager.instance) {
            RouteManager.instance = new RouteManager();
        }
        return RouteManager.instance;
    }

    public intiRouteManager(app: Application) {
        app.use("/uploads", express.static("uploads"));

        app.get("/health", (req: Request, res: Response, _next: NextFunction) => {
            res.status(200)
                .set({
                    "Content-Type": "application/json",
                    "X-Service": "aware-auth-service",
                })
                .json({
                    success: true,
                    message: "Everything is healthy and up and running",
                });
        });

        this.authRoutes.authRoutesInit(app);
        this.garmentsRoutes.garmentsRoutesInit(app);

        app.use(errorMiddleware);
    }
}

export default RouteManager;
