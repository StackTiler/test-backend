import { Application } from "express";
declare class RouteManager {
    private static instance;
    private garmentsRoutes;
    private constructor();
    static getInstance(): RouteManager;
    intiRouteManager(app: Application): void;
}
export default RouteManager;
