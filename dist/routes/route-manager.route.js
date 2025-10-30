"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const error_middleware_1 = require("../middlewares/error.middleware");
const garments_routes_1 = __importDefault(require("./v1/garments.routes"));
class RouteManager {
    constructor() {
        this.garmentsRoutes = new garments_routes_1.default();
    }
    ;
    static getInstance() {
        if (!RouteManager.instance) {
            RouteManager.instance = new RouteManager();
        }
        return RouteManager.instance;
    }
    intiRouteManager(app) {
        app.use("/uploads", express_1.default.static("uploads"));
        app.get('/health', (req, res, _next) => {
            res.status(200).set({
                "Content-Type": "application/json",
                "X-Service": "aware-auth-service"
            }).json({
                success: true,
                message: 'Every thing is healthy and up and runnig'
            });
        });
        this.garmentsRoutes.garmentsRoutesInit(app);
        app.use(error_middleware_1.errorMiddleware);
    }
}
exports.default = RouteManager;
