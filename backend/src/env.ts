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
    // Mailchimp's hosted form endpoint. Unset means the forwarding is simply off,
    // which is what dev and the test suite run with.
    // An empty value in .env means "off", not "invalid"; without this the server
    // refuses to boot when somebody clears the line instead of deleting it.
    MAILCHIMP_SUBSCRIBE_URL: z.preprocess((v) => v || undefined, z.url().optional()),
    /**
     * Preferred over the form endpoint when set. The form endpoint answers
     * "success" to everything, including payloads it silently discards; the API
     * returns the stored record, so a failure is visible instead of guessed at.
     * Key looks like "abc123...-us18"; the suffix is the server prefix.
     */
    MAILCHIMP_API_KEY: z
        .string()
        .regex(/^[0-9a-f]{32}-[a-z]{2}\d{1,3}$/, 'Expected a Mailchimp API key')
        .optional(),
    MAILCHIMP_AUDIENCE_ID: z.string().min(1).optional(),
    MAILCHIMP_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
    PUBLIC_ORIGIN: z.string().default('https://svadobnysalonjarka.sk'),
    CORS_ORIGIN: z.preprocess((v) => v || undefined, z.string().optional()),
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
