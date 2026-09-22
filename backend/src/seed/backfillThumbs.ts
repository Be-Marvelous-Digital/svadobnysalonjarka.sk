import { access, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { connectDatabase, disconnectDatabase } from '../db.js';
import { env } from '../env.js';
import { logger } from '../logger.js';
import { Photo } from '../models/Photo.js';
import { thumbUrlFor } from '../services/photoStorage.js';

/**
 * Writes the missing thumbnail beside every stored gallery photo.
 *
 * Uploads have produced both sizes since the tiles started using the smaller
 * one; this covers everything written before that, including a bulk import.
 * Safe to run repeatedly: a photo that already has its thumbnail is skipped.
 *
 *   npm run backfill:thumbs
 */
const THUMB_MAX_EDGE = 640;
const THUMB_QUALITY = 74;

const toDisk = (url: string) => path.join(env.UPLOAD_DIR, url.replace('/images/', ''));
const exists = (file: string) =>
    access(file).then(
        () => true,
        () => false,
    );

async function run(): Promise<void> {
    await connectDatabase();
    try {
        const photos = await Photo.find().select('url').lean();
        let made = 0;
        let skipped = 0;
        let failed = 0;

        for (const photo of photos) {
            const thumbUrl = thumbUrlFor(photo.url);
            if (!thumbUrl) {
                skipped++;
                continue;
            }

            const target = toDisk(thumbUrl);
            if (await exists(target)) {
                skipped++;
                continue;
            }

            const source = toDisk(photo.url);
            if (!(await exists(source))) {
                logger.warn({ url: photo.url }, 'Original is missing, no thumbnail written');
                failed++;
                continue;
            }

            try {
                await mkdir(path.dirname(target), { recursive: true });
                await sharp(source)
                    .resize({ width: THUMB_MAX_EDGE, height: THUMB_MAX_EDGE, fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: THUMB_QUALITY })
                    .toFile(target);
                made++;
            } catch (error) {
                logger.warn({ url: photo.url, error }, 'Could not write thumbnail');
                failed++;
            }
        }

        logger.info(
            `Thumbnails: ${made} written, ${skipped} already there or not stored here${failed ? `, ${failed} failed` : ''}`,
        );
    } finally {
        await disconnectDatabase();
    }
}

run().catch((error) => {
    logger.error({ error }, 'Thumbnail backfill failed');
    process.exit(1);
});
