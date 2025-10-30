import { Server } from "http";
import express, { Application } from "express";
import cors from "cors"
import envConfig from "./config/env.config";
import RouteManager from "./routes/route-manager.route";
import { MongooseConnection } from "./config/database.connection";

class AwareAuthApp {
  private expressApp: Application;
  private readonly routeManger: RouteManager;
  private readonly databaseConnector: MongooseConnection;
  private readonly PORT: number;
  private server?: Server;
  private shuttingDown = false;

  constructor() {
    this.expressApp = express();
    this.PORT = envConfig.PORT || 3000;

    this.routeManger= RouteManager.getInstance();
    this.databaseConnector= MongooseConnection.getInstance({ 
      uri: envConfig.DB_URL.toString(), 
      options:{
        dbName: "kumud"
      } 
    });

    this.configureApp();
    this.handleProcessEvents();
  }

  private configureApp(): void {
    this.expressApp.use(cors())
    this.expressApp.use(express.json());
    this.expressApp.use(express.urlencoded({ extended: true }));

    this.databaseConnector.connect();
    this.routeManger.intiRouteManager(this.expressApp);
  }


  private handleProcessEvents(): void {
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

  private async gracefulShutdown(signal: string, exitCode = 0): Promise<void> {
    if (this.shuttingDown) return;
    this.shuttingDown = true;

    console.warn(`Received ${signal}. Starting graceful shutdown...`);

    try {
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server!.close(() => {
            console.log("HTTP server closed");
            resolve();
          });
        });
      }

      this.databaseConnector.disconnect()

      console.log("Cleanup complete. Exiting.");
      process.exit(exitCode);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  }

  public initializeApplication(): void {
    this.server = this.expressApp.listen(this.PORT, () => {
      console.log(`AwareAuthApp listening on port ${this.PORT}`);
    });
  }
}

export default AwareAuthApp;
