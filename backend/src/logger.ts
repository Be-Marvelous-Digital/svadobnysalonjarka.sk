import pino from 'pino';
import { env } from './env.js';

const LEVELS = { production: 'info', development: 'debug', test: 'silent' } as const;

export const logger = pino({
    level: LEVELS[env.NODE_ENV],
    redact: ['req.headers.cookie', 'req.headers.authorization'],
});
