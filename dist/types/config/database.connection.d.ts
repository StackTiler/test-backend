import { IMongooseConnectionOptions } from "../interfaces/database.interface";
export declare class MongooseConnection {
    private static instance;
    private readonly uri;
    private readonly options;
    private readonly serviceName;
    private readonly retryDelayMs;
    private isConnected;
    private connectionPromise?;
    private constructor();
    static getInstance(config: IMongooseConnectionOptions): MongooseConnection;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private registerEventHandlers;
}
