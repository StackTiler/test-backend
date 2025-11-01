import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().min(1).default(3000),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  FRONTEND_URL: z.string().default("http://localhost:8000"),
  DB_URL: z.string().min(10),
  SAME_SITE: z.string().default("none"),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string()
});

const env = envSchema.parse(process.env);
type Env = z.infer<typeof envSchema>

const ENV: Env = {
  PORT: env.PORT,
  NODE_ENV: env.NODE_ENV,
  FRONTEND_URL: env.FRONTEND_URL,
  DB_URL: env.DB_URL,
  SAME_SITE: env.SAME_SITE,
  JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN,
};

export default ENV;
export type { Env };