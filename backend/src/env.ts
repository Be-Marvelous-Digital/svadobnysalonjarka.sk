import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    MONGODB_URI: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    // Credentials the seed writes into the users collection. Change them there or here, then re-seed.
    ADMIN_USERNAME: z.string().min(3).default('admin'),
    ADMIN_PASSWORD: z.string().min(8).default('JarkaAdmin123'),
    UPLOAD_DIR: z.string().default('/var/lib/jarka/uploads'),
    // Requests allowed per window: 15 minutes for login, an hour for reservations,
    // a minute for the catch-all.
    LOGIN_RATE_LIMIT: z.coerce.number().int().positive().default(10),
    RESERVATION_RATE_LIMIT: z.coerce.number().int().positive().default(8),
    API_RATE_LIMIT: z.coerce.number().int().positive().default(120),
    PUBLIC_ORIGIN: z.string().default('https://svadobnysalonjarka.sk'),
    CORS_ORIGIN: z.string().optional(),
    COOKIE_SECURE: z
        .enum(['true', 'false'])
        .default('true')
        .transform((v) => v === 'true'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment configuration:', z.treeifyError(parsed.error));
    process.exit(1);
}

export const env = parsed.data;
