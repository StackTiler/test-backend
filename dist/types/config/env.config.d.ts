import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        production: "production";
    }>>;
    DB_URL: z.ZodString;
}, z.core.$strip>;
type Env = z.infer<typeof envSchema>;
declare const ENV: Env;
export default ENV;
export type { Env };
