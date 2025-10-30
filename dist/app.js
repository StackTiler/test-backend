"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_config_1 = __importDefault(require("./config/env.config"));
const route_manager_route_1 = __importDefault(require("./routes/route-manager.route"));
const database_connection_1 = require("./config/database.connection");
class AwareAuthApp {
    constructor() {
        this.shuttingDown = false;
        this.expressApp = (0, express_1.default)();
        this.PORT = env_config_1.default.PORT || 3000;
        this.routeManger = route_manager_route_1.default.getInstance();
        this.databaseConnector = database_connection_1.MongooseConnection.getInstance({
            uri: env_config_1.default.DB_URL.toString(),
            options: {
                dbName: "kumud"
            }
        });
        this.configureApp();
        this.handleProcessEvents();
    }
    configureApp() {
        this.expressApp.use((0, cors_1.default)());
        this.expressApp.use(express_1.default.json());
        this.expressApp.use(express_1.default.urlencoded({ extended: true }));
        this.databaseConnector.connect();
        this.routeManger.intiRouteManager(this.expressApp);
    }
    handleProcessEvents() {
        process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));
        process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));
        process.on("uncaughtException", (err) => {
            console.error("Uncaught Exception:", err);
            this.gracefulShutdown("uncaughtException", 1);
        });
        process.on("unhandledRejection", (reason) => {
            console.error("Unhandled Rejection:", reason);
            this.gracefulShutdown("unhandledRejection", 1);
        });
    }
    async gracefulShutdown(signal, exitCode = 0) {
        if (this.shuttingDown)
            return;
        this.shuttingDown = true;
        console.warn(`Received ${signal}. Starting graceful shutdown...`);
        try {
            if (this.server) {
                await new Promise((resolve) => {
                    this.server.close(() => {
                        console.log("HTTP server closed");
                        resolve();
                    });
                });
            }
            this.databaseConnector.disconnect();
            console.log("Cleanup complete. Exiting.");
            process.exit(exitCode);
        }
        catch (err) {
            console.error("Error during shutdown:", err);
            process.exit(1);
        }
    }
    initializeApplication() {
        this.server = this.expressApp.listen(this.PORT, '0.0.0.0', () => {
            console.log(`AwareAuthApp listening on port ${this.PORT}`);
        });
    }
}
exports.default = AwareAuthApp;
