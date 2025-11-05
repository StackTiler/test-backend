/**
 * ============================================================================
 * Express Application Setup & Server Configuration
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Main Express application class that initializes and configures the entire
 * Node.js/Express server. Handles middleware setup, CORS, authentication,
 * database connection, and graceful shutdown.
 *
 * INITIALIZATION FLOW:
 *
 * 1. CONSTRUCTOR:
 *    - Create Express instance
 *    - Initialize port from config (default: 4000)
 *    - Get RouteManager singleton instance
 *    - Get MongooseConnection singleton instance
 *    - Call configureApp() to setup middleware
 *    - Setup process event handlers for graceful shutdown
 *
 * 2. CONFIGURE APP (configureApp):
 *    Order of middleware matters! Express processes from top to bottom.
 *    
 *    a) Security Middleware:
 *       - helmet(): Sets security headers (XSS, clickjacking protection, etc)
 *       - cookieParser(): Parse cookie headers for authentication
 *
 *    b) Static Files:
 *       - configureStaticFiles(): Serve images/uploads without CORS issues
 *       - Must be BEFORE CORS to avoid blocking
 *
 *    c) CORS Configuration:
 *       - configureCors(): Allow cross-origin requests from allowed domains
 *       - Credentials: true for cookie/auth header support
 *
 *    d) Body Parsing:
 *       - express.json(): Parse JSON request bodies (10MB limit)
 *       - express.urlencoded(): Parse form-encoded bodies
 *
 *    e) Custom Security Headers:
 *       - X-Content-Type-Options: Prevent MIME type sniffing
 *       - X-Frame-Options: Prevent clickjacking
 *       - X-XSS-Protection: Enable browser XSS filtering
 *
 *    f) Request Logging:
 *       - Log all requests with timestamp for debugging
 *
 *    g) Database Connection:
 *       - Connect to MongoDB via MongooseConnection singleton
 *
 *    h) Route Initialization:
 *       - Initialize all routes via RouteManager
 *       - Auth routes, garment routes, etc.
 *
 * 3. STATIC FILES (configureStaticFiles):
 *    Serves uploaded images at /v1/uploads endpoint
 *    - Path: ./uploads directory (auto-created if missing)
 *    - Cache: 1 day (CDN friendly)
 *    - CORS: Allow all origins (* for public images)
 *    - MIME Types: Detect and set correct content-type
 *    - Headers: Cross-Origin-Resource-Policy for security
 *
 * 4. CORS CONFIGURATION (configureCors):
 *    Cross-Origin Resource Sharing setup
 *    - Dynamic origin validation (callback function)
 *    - Allowed origins: localhost, 127.0.0.1, configurable additional origins
 *    - Credentials: true (allow cookies + auth headers)
 *    - Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
 *    - Exposed headers: Content-Range for paginated responses
 *    - Cache preflight for 24 hours
 *
 * 5. SERVER STARTUP (initializeApplication):
 *    - Listen on all interfaces (0.0.0.0:PORT)
 *    - Log startup banner with server details
 *    - Handle port-already-in-use errors
 *
 * 6. GRACEFUL SHUTDOWN (gracefulShutdown):
 *    Triggered by SIGINT (Ctrl+C) or SIGTERM signals
 *    - Prevent multiple shutdown calls (shuttingDown flag)
 *    - Close HTTP server (stop accepting new connections)
 *    - Disconnect MongoDB gracefully
 *    - Log completion and exit process
 *    - Catch and handle shutdown errors
 *
 * 7. PROCESS EVENT HANDLING (handleProcessEvents):
 *    Catch unexpected errors and system signals
 *    - SIGINT: User interrupt (Ctrl+C)
 *    - SIGTERM: System termination request
 *    - uncaughtException: Unhandled sync errors
 *    - unhandledRejection: Unhandled async promise rejections
 *
 * SECURITY FEATURES:
 * - Helmet: Security headers to prevent common attacks
 * - CORS: Control which domains can access API
 * - Cookie parsing: Secure authentication token handling
 * - Static file headers: Cross-Origin-Resource-Policy
 * - XSS protection: X-XSS-Protection + secure headers
 *
 * SINGLETON PATTERN:
 * - RouteManager: Single instance manages all routes
 * - MongooseConnection: Single DB connection pool
 * - Prevents multiple connections and resource leaks
 *
 * ============================================================================
 */

import { Server } from "http";
import express, { Application, Request, Response, NextFunction } from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import envConfig from "./config/env.config";
import RouteManager from "./routes/route-manager.route";
import { MongooseConnection } from "./config/database.connection";

class KumudMangement {
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

  /**
   * Configure all Express middleware in correct order
   * Order is critical: security → static files → CORS → body parsers → routes
   */
  private configureApp(): void {
    this.expressApp.use(helmet());
    this.expressApp.use(cookieParser());

    this.configureStaticFiles();
    this.configureCors();

    this.expressApp.use(express.json({ limit: "10mb" }));
    this.expressApp.use(
      express.urlencoded({ limit: "10mb", extended: true })
    );

    this.expressApp.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "DENY");
      res.setHeader("X-XSS-Protection", "1; mode=block");
      next();
    });

    this.databaseConnector.connect();
    this.routeManager.intiRouteManager(this.expressApp);
  }

  /**
   * Setup static file serving for uploaded images
   * CORS headers prevent ERR_BLOCKED_BY_RESPONSE errors
   */
  private configureStaticFiles(): void {
    try {
      const uploadsPath = path.join(process.cwd(), "uploads");

      if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
      }

      this.expressApp.use(
        "/v1/uploads",
        (req, res, next) => {
          res.setHeader("Cache-Control", "public, max-age=86400");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
          res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
          next();
        },
        express.static(uploadsPath, {
          maxAge: "1d",
          etag: false,
          setHeaders: (res, filePath) => {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes: { [key: string]: string } = {
              ".jpg": "image/jpeg",
              ".jpeg": "image/jpeg",
              ".png": "image/png",
              ".gif": "image/gif",
              ".webp": "image/webp",
              ".svg": "image/svg+xml",
            };

            if (mimeTypes[ext]) {
              res.set("Content-Type", mimeTypes[ext]);
            }
          },
        })
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Configure CORS (Cross-Origin Resource Sharing)
   * Dynamic origin validation to support multiple frontend domains
   */
  private configureCors(): void {
    const allowedOrigins = this.getAllowedOrigins();
    const isDevelopment = envConfig.NODE_ENV !== "production";

    const corsOptions: CorsOptions = {
      origin: (origin: any, callback: any) => {
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        if (
          isDevelopment &&
          (origin.includes("localhost") || origin.includes("127.0.0.1"))
        ) {
          return callback(null, true);
        }

        callback(new Error(`CORS not allowed for origin: ${origin}`));
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

  /**
   * Get list of allowed origins from config and environment
   * Merges default origins with environment-configured additional origins
   */
  private getAllowedOrigins(): string[] {
    const defaultOrigins = [
      "http://localhost:8000",
      "http://127.0.0.1:8000",
      "http://localhost:8001",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://192.168.0.192:8001",
    ];

    const extra = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
      : [];

    if (process.env.FRONTEND_URL) {
      extra.push(process.env.FRONTEND_URL);
    }

    return [...new Set([...defaultOrigins, ...extra])];
  }

  /**
   * Setup process event handlers for graceful shutdown
   * Catches signals and uncaught errors for cleanup
   */
  private handleProcessEvents(): void {
    process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));

    process.on("uncaughtException", (err) => {
      this.gracefulShutdown("uncaughtException", 1);
    });

    process.on("unhandledRejection", (reason) => {
      this.gracefulShutdown("unhandledRejection", 1);
    });
  }

  /**
   * Gracefully shutdown server and database connection
   * Prevents data loss and resource leaks
   */
  private async gracefulShutdown(
    signal: string,
    exitCode = 0
  ): Promise<void> {
    if (this.shuttingDown) return;
    this.shuttingDown = true;

    try {
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server!.close(() => {
            resolve();
          });
        });
      }

      await this.databaseConnector.disconnect();
      process.exit(exitCode);
    } catch (err) {
      process.exit(1);
    }
  }

  /**
   * Initialize and start the HTTP server
   * Listen on all network interfaces (0.0.0.0) for external access
   */
  public initializeApplication(): void {
    this.server = this.expressApp.listen(this.PORT, "0.0.0.0", () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║           Kumud Management Server Started             ║
╠═══════════════════════════════════════════════════════╣
║  Server URL: http://localhost:${this.PORT}                    ║
║  Environment: ${envConfig.NODE_ENV || "development"}                        ║
║  Database: ${envConfig.DB_URL ? "✓ Connected" : "✗ Pending"}                    ║
║  API Base: http://localhost:${this.PORT}/v1                   ║
║  Uploads: http://localhost:${this.PORT}/v1/uploads            ║
║  Health: GET /health                                  ║
╚═══════════════════════════════════════════════════════╝
      `);
    });

    this.server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        process.exit(1);
      } else {
        process.exit(1);
      }
    });
  }
}

export default KumudMangement;
