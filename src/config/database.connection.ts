import mongoose, { ConnectOptions } from "mongoose";
import { IMongooseConnectionOptions } from "../interfaces/database.interface";

export class MongooseConnection {
  private static instance: MongooseConnection;
  private readonly uri: string;
  private readonly options: ConnectOptions;
  private readonly serviceName: string;
  private readonly retryDelayMs: number;
  private isConnected = false;
  private connectionPromise?: Promise<typeof mongoose>;

  private constructor({
    uri,
    options = {},
    serviceName = "default-service",
    retryDelayMs = 2000,
  }: IMongooseConnectionOptions) {
    this.uri = uri;
    this.options = options;
    this.serviceName = serviceName;
    this.retryDelayMs = retryDelayMs;
  }


  public static getInstance(config: IMongooseConnectionOptions): MongooseConnection {
    if (!MongooseConnection.instance) {
      MongooseConnection.instance = new MongooseConnection(config);
    }
    return MongooseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log(`[${this.serviceName}] MongoDB already connected`);
      return;
    }

    if (this.connectionPromise) {
      await this.connectionPromise;
      return;
    }

    try {
      mongoose.set("strictQuery", true);
      this.connectionPromise = mongoose.connect(this.uri, this.options);

      await this.connectionPromise;
      this.isConnected = true;
      this.registerEventHandlers();

      console.log(`[${this.serviceName}] MongoDB connected`);
    } catch (error) {
      console.error(
        `[${this.serviceName}] MongoDB connection failed:`,
        (error as Error).message
      );

      setTimeout(() => {
        console.log(
          `[${this.serviceName}] Retrying connection in ${this.retryDelayMs / 1000}s`
        );
        this.connect().catch(console.error);
      }, this.retryDelayMs);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      console.warn(`[${this.serviceName}] No active MongoDB connection`);
      return;
    }

    await mongoose.disconnect();
    this.isConnected = false;
    console.log(`[${this.serviceName}] MongoDB disconnected`);
  }

  private registerEventHandlers(): void {
    mongoose.connection.on("connected", () => {
      console.log(`[${this.serviceName}] Mongoose connection established`);
    });

    mongoose.connection.on("reconnected", () => {
      console.log(`[${this.serviceName}] Mongoose reconnected`);
    });

    mongoose.connection.on("disconnected", () => {
      this.isConnected = false;
      console.warn(`[${this.serviceName}] Mongoose disconnected`);
    });

    mongoose.connection.on("error", (err) => {
      console.error(`[${this.serviceName}] Mongoose error:`, err);
    });
  }
}
