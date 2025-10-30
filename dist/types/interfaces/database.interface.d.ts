import { ConnectOptions } from "mongoose";
export interface IMongooseConnectionOptions {
    uri: string;
    options?: ConnectOptions;
    serviceName?: string;
    retryDelayMs?: number;
}
