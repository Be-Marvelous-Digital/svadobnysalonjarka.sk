import { randomBytes } from 'node:crypto';
import { mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { env } from '../env.js';
import { logger } from '../logger.js';
import type { CategoryKey } from '../constants.js';

const GALLERY_DIR = () => path.join(env.UPLOAD_DIR, 'gallery');
const MAX_EDGE = 1600;
/**
 * ~400 MP, far above any camera an uploader will realistically use. There is no
 * file-size limit, but a decompression bomb is about decoded pixels rather than
 * bytes on disk, so this stays as the backstop against an out-of-memory crash.
 */
const MAX_INPUT_PIXELS = 400_000_000;
const ACCEPTED_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif', 'gif', 'tiff', 'heif', 'svg']);

export class UnsupportedImageError extends Error {
    constructor() {
        super('Nepodporovaný formát obrázka.');
        this.name = 'UnsupportedImageError';
    }
}

/**
 * Reads the upload from a temporary file rather than a buffer: multer streams it
 * to disk, sharp streams it back out, so a large photo never has to fit in RAM.
 * Whatever comes in, a resized WebP comes out.
 */
export async function storePhoto(category: CategoryKey, sourcePath: string): Promise<string> {
    const pipeline = sharp(sourcePath, { limitInputPixels: MAX_INPUT_PIXELS });

    // Trust the decoded bytes, not the multipart Content-Type the client sent.
    const { format } = await pipeline.metadata().catch(() => {
        throw new UnsupportedImageError();
    });
    if (!format || !ACCEPTED_FORMATS.has(format)) throw new UnsupportedImageError();

    const dir = path.join(GALLERY_DIR(), category);
    await mkdir(dir, { recursive: true });
    const filename = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.webp`;

    try {
        await pipeline
            .rotate()
            .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 78 })
            .toFile(path.join(dir, filename));
    } catch (error) {
        // A truncated or corrupt file only fails once sharp reads past the header.
        throw error instanceof Error && /unsupported|corrupt|premature/i.test(error.message)
            ? new UnsupportedImageError()
            : error;
    }

    return `/images/gallery/${category}/${filename}`;
}

/** Removes a multer temp file once it has been processed, successfully or not. */
export async function discardUpload(sourcePath: string): Promise<void> {
    await unlink(sourcePath).catch((error) => logger.warn({ error, sourcePath }, 'Could not remove temporary upload'));
}

const URL_PREFIX = '/images/gallery/';

/** True for photos this server wrote into UPLOAD_DIR, false for bundled assets and external links. */
export function isStoredPhoto(url: string): boolean {
    return url.startsWith(URL_PREFIX);
}

/** Only removes files this server wrote; externally linked photos are just dropped from the database. */
export async function removePhotoFile(url: string): Promise<void> {
    if (!isStoredPhoto(url)) return;
    const relative = url.slice(URL_PREFIX.length);
    if (relative.includes('..')) return;
    const target = path.resolve(GALLERY_DIR(), relative);
    if (!target.startsWith(path.resolve(GALLERY_DIR()) + path.sep)) return;
    await unlink(target).catch((error) => logger.warn({ error, url }, 'Could not remove photo file'));
}
