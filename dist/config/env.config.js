"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().min(1).default(3000),
    NODE_ENV: zod_1.z.enum(['development', 'production']).default('development'),
    DB_URL: zod_1.z.string().min(10)
});
const env = envSchema.parse(process.env);
const ENV = {
    PORT: env.PORT,
    NODE_ENV: env.NODE_ENV,
    DB_URL: env.DB_URL
};
exports.default = ENV;
