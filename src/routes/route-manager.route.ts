import { Application, NextFunction, Request, Response } from "express";
import { errorMiddleware } from "../middlewares/error.middleware";
import GarmentsRoutes from "./v1/garments.routes";

class RouteManager {
    private static instance:RouteManager;
    private garmentsRoutes: GarmentsRoutes;
    
    private constructor() {
        this.garmentsRoutes= new GarmentsRoutes()
    };

    public static getInstance(): RouteManager {
        if (!RouteManager.instance) {
            RouteManager.instance = new RouteManager();
        }
        return RouteManager.instance;
    }

    public intiRouteManager(app: Application){
        app.get('/health', (req: Request,res: Response, _next: NextFunction)=>{
            res.status(200).set({
                "Content-Type": "application/json",
                "X-Service": "aware-auth-service"
            }).json({
                success: true,
                message: 'Every thing is healthy and up and runnig'
            })
        })

        this.garmentsRoutes.garmentsRoutesInit(app)

        app.use(errorMiddleware)
    }
}

export default RouteManager