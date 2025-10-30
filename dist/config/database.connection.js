"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class MongooseConnection {
    constructor({ uri, options = {}, serviceName = "default-service", retryDelayMs = 2000, }) {
        this.isConnected = false;
        this.uri = uri;
        this.options = options;
        this.serviceName = serviceName;
        this.retryDelayMs = retryDelayMs;
    }
    static getInstance(config) {
        if (!MongooseConnection.instance) {
            MongooseConnection.instance = new MongooseConnection(config);
        }
        return MongooseConnection.instance;
    }
    async connect() {
        if (this.isConnected) {
            console.log(`[${this.serviceName}] MongoDB already connected`);
            return;
        }
        if (this.connectionPromise) {
            await this.connectionPromise;
            return;
        }
        try {
            mongoose_1.default.set("strictQuery", true);
            this.connectionPromise = mongoose_1.default.connect(this.uri, this.options);
            await this.connectionPromise;
            this.isConnected = true;
            this.registerEventHandlers();
            console.log(`[${this.serviceName}] MongoDB connected`);
        }
        catch (error) {
            console.error(`[${this.serviceName}] MongoDB connection failed:`, error.message);
            setTimeout(() => {
                console.log(`[${this.serviceName}] Retrying connection in ${this.retryDelayMs / 1000}s`);
                this.connect().catch(console.error);
            }, this.retryDelayMs);
        }
    }
    async disconnect() {
        if (!this.isConnected) {
            console.warn(`[${this.serviceName}] No active MongoDB connection`);
            return;
        }
        await mongoose_1.default.disconnect();
        this.isConnected = false;
        console.log(`[${this.serviceName}] MongoDB disconnected`);
    }
    registerEventHandlers() {
        mongoose_1.default.connection.on("connected", () => {
            console.log(`[${this.serviceName}] Mongoose connection established`);
        });
        mongoose_1.default.connection.on("reconnected", () => {
            console.log(`[${this.serviceName}] Mongoose reconnected`);
        });
        mongoose_1.default.connection.on("disconnected", () => {
            this.isConnected = false;
            console.warn(`[${this.serviceName}] Mongoose disconnected`);
        });
        mongoose_1.default.connection.on("error", (err) => {
            console.error(`[${this.serviceName}] Mongoose error:`, err);
        });
    }
}
exports.MongooseConnection = MongooseConnection;
