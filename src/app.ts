import { Server } from "http";
import express, { Application, Request, Response, NextFunction } from "express";
import cors, { CorsOptions } from "cors";
import envConfig from "./config/env.config";
import RouteManager from "./routes/route-manager.route";
import { MongooseConnection } from "./config/database.connection";

class AwareAuthApp {
  private expressApp: Application;
  private readonly routeManager: RouteManager;
  private readonly databaseConnector: MongooseConnection;
  private readonly PORT: number;
  private server?: Server;
  private shuttingDown = false;

  constructor() {
    this.expressApp = express();
    this.PORT = envConfig.PORT || 4000;

    this.routeManager = RouteManager.getInstance();
    this.databaseConnector = MongooseConnection.getInstance({
      uri: envConfig.DB_URL.toString(),
      options: {
        dbName: "kumud",
      },
    });

    this.configureApp();
    this.handleProcessEvents();
  }

  private configureApp(): void {
    this.configureCors();

    this.expressApp.use(express.json({ limit: "50mb" }));
    this.expressApp.use(express.urlencoded({ limit: "50mb", extended: true }));

    this.expressApp.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "DENY");
      res.setHeader("X-XSS-Protection", "1; mode=block");

      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
      );

      next();
    });

    this.expressApp.use((req: Request, res: Response, next: NextFunction) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${req.method} ${req.path}`);
      next();
    });

    this.databaseConnector.connect();
    this.routeManager.intiRouteManager(this.expressApp);
  }

  private configureCors(): void {
    const allowedOrigins = this.getAllowedOrigins();

    const corsOptions: CorsOptions = {
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`[CORS] Rejected origin: ${origin}`);
          callback(new Error(`CORS not allowed for origin: ${origin}`));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
      ],
      exposedHeaders: ["Content-Range", "X-Content-Range"],
      maxAge: 86400,
      optionsSuccessStatus: 200,
    };

    this.expressApp.use(cors(corsOptions));
  }

  private getAllowedOrigins(): string[] {
    return [
      "http://192.168.29.78:8000",
      "http://192.168.27.78:8000",
      "http://192.168.1.65:8000",
      "http://localhost:8000",
      "http://127.0.0.1:8000",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ];
  }

  private handleProcessEvents(): void {
    process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));

    process.on("uncaughtException", (err) => {
      console.error("[UNCAUGHT EXCEPTION]", err);
      this.gracefulShutdown("uncaughtException", 1);
    });

    process.on("unhandledRejection", (reason) => {
      console.error("[UNHANDLED REJECTION]", reason);
      this.gracefulShutdown("unhandledRejection", 1);
    });
  }

  private async gracefulShutdown(signal: string, exitCode = 0): Promise<void> {
    if (this.shuttingDown) return;
    this.shuttingDown = true;

    console.warn(
      `\n[${new Date().toISOString()}] Received ${signal}. Starting graceful shutdown...`
    );

    try {
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server!.close(() => {
            console.log("HTTP server closed");
            resolve();
          });
        });
      }

      await this.databaseConnector.disconnect();
      console.log("Database connection closed");

      console.log("Cleanup complete. Exiting gracefully.\n");
      process.exit(exitCode);
    } catch (err) {
      console.error("[SHUTDOWN ERROR]", err);
      process.exit(1);
    }
  }

  public initializeApplication(): void {
    this.server = this.expressApp.listen(this.PORT, "0.0.0.0", () => {
      console.log(`
Kumud Started Successfully
Server:      http://localhost:${this.PORT}
Environment: ${process.env.NODE_ENV || "development"}
Database:    ${envConfig.DB_URL ? "Connected" : "Pending"}

CORS Allowed Origins:
   - http://192.168.27.78:8000
   - http://localhost:8000
   - http://localhost:3000

API Base URL: http://localhost:${this.PORT}/v1
Health Check: GET /health
      `);
    });

    this.server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `\nPort ${this.PORT} is already in use. Please use a different port.\n`
        );
      } else {
        console.error("Server error:", err);
      }
      process.exit(1);
    });
  }
}

export default AwareAuthApp;
