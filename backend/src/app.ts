import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { env } from './env.js';
import { logger } from './logger.js';
import { adminRouter } from './routes/admin.js';
import { publicRouter } from './routes/public.js';
import { usersRouter } from './routes/users.js';

export function createApp() {
    const app = express();

    app.set('trust proxy', 1);
    app.use(pinoHttp({ logger }));
    app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
    if (env.CORS_ORIGIN) app.use(cors({ origin: env.CORS_ORIGIN.split(','), credentials: true }));
    app.use(express.json({ limit: '100kb' }));
    app.use(cookieParser());

    /**
     * nginx serves uploads in production and this process never sees the request.
     * Mounted anyway so photos resolve in local development, where Vite proxies
     * /images straight here — without it an uploaded photo 404s on a dev machine.
     * The hero falls back to the bundled file the same way nginx does.
     */
    app.use('/images', express.static(env.UPLOAD_DIR));
    app.get('/images/site/hero.webp', (_req, res) => res.redirect(302, '/assets/hero.webp'));

    app.get('/api/health', async (_req, res) => {
        const dbUp = mongoose.connection.readyState === 1;
        res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'ok' : 'degraded' });
    });

    // Backstop only. The reservation and login routes keep their own far tighter limits;
    // this one exists so /availability and /gallery cannot be hammered for free.
    app.use(
        '/api',
        rateLimit({
            windowMs: 60 * 1000,
            limit: env.API_RATE_LIMIT,
            standardHeaders: 'draft-7',
            legacyHeaders: false,
            skip: (req) => req.path === '/health',
            message: { error: 'Príliš veľa požiadaviek. Skúste to o chvíľu znova.' },
        }),
    );

    app.use('/api', publicRouter);
    app.use('/api/admin/users', usersRouter);
    app.use('/api/admin', adminRouter);

    app.use('/api', (_req, res) => res.status(404).json({ error: 'Neznámy endpoint' }));

    app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        logger.error({ err }, 'Unhandled error');
        res.status(500).json({ error: 'Nastala chyba na serveri.' });
    });

    return app;
}
