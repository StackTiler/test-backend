// src/config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';
import fs from 'fs';

// Load .env for local development
dotenv.config();

/**
 * Reads secret from Docker secrets file or falls back to environment variable
 * Use in production with Docker Swarm/Kubernetes secrets
 */
const getSecret = (secretName: string): string | undefined => {
  const secretPath = `/run/secrets/${secretName}`;
  
  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, 'utf8').trim();
  }
  
  // Fallback to environment variable (local dev)
  return process.env[secretName.toUpperCase()];
};

// Define validation schema
const envSchema = z.object({
  PORT: z.coerce.number().min(1).default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  DB_URL: z.string().min(10),
  SAME_SITE: z.enum(['none', 'lax', 'strict']).default('lax'),
  COOKIE_SECRET: z.string().min(32).optional(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

// Build config object with Docker secrets support
const rawConfig = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL,
  DB_URL: getSecret('db_url') || process.env.DB_URL,
  SAME_SITE: process.env.SAME_SITE,
  COOKIE_SECRET: getSecret('cookie_secret') || process.env.COOKIE_SECRET,
  JWT_ACCESS_SECRET: getSecret('jwt_access_secret') || process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: getSecret('jwt_refresh_secret') || process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
};

// Validate and parse with Zod
const env = envSchema.parse(rawConfig);

// Export typed config
export type Env = z.infer<typeof envSchema>;

const ENV: Env = {
  PORT: env.PORT,
  NODE_ENV: env.NODE_ENV,
  FRONTEND_URL: env.FRONTEND_URL,
  DB_URL: env.DB_URL,
  SAME_SITE: env.SAME_SITE,
  COOKIE_SECRET: env.COOKIE_SECRET,
  JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN,
};

export default ENV;
