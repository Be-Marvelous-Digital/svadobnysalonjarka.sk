import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './db.js';
import { env } from './env.js';
import { logger } from './logger.js';

async function main(): Promise<void> {
    await connectDatabase();
    const server = createApp().listen(env.PORT, () => logger.info(`API listening on :${env.PORT}`));

    const shutdown = async (signal: string) => {
        logger.info(`${signal} received, shutting down`);
        server.close();
        await disconnectDatabase();
        process.exit(0);
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((error) => {
    logger.error({ error }, 'Failed to start API');
    process.exit(1);
});
