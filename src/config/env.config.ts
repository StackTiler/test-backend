import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().min(1).default(3000),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  DB_URL: z.string().min(10)
});

const env = envSchema.parse(process.env);
type Env = z.infer<typeof envSchema>

const ENV: Env = {
  PORT: env.PORT,
  NODE_ENV: env.NODE_ENV,
  DB_URL: env.DB_URL
};

export default ENV;
export type { Env };