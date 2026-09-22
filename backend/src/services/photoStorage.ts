import { randomBytes } from 'node:crypto';
import { mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { env } from '../env.js';
import { logger } from '../logger.js';
import { HERO_SLOT, HERO_STABLE_PATH, type CategoryKey, type SiteImageSlot } from '../constants.js';

const UPLOADS_DIR = () => env.UPLOAD_DIR;

/**
 * Gallery photos and the smaller fixed positions are never drawn wider than a
 * column, so 1600px covers them at twice the pixel density.
 */
const MAX_EDGE = 1600;
const QUALITY = 78;

/**
 * The hero is drawn across the whole viewport, where 1600px is already being
 * stretched on an ordinary laptop. A wider file costs nothing here: at this size
 * a slightly lower quality is invisible, and 2560px at 72 lands under what 1600px
 * at 78 would have weighed.
 */
const HERO_MAX_EDGE = 2560;
const HERO_QUALITY = 72;
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
    return encodeTo(sourcePath, path.join('gallery', category), randomName(), MAX_EDGE, QUALITY);
}

/**
 * Same pipeline, written under site/ instead of a gallery category.
 *
 * The hero keeps one fixed filename because the static shell preloads it before
 * any JavaScript runs and cannot be told a new URL; nginx serves that path with
 * revalidation so a replacement is still picked up. Every other slot gets a
 * random name and can be cached forever.
 */
export async function storeSiteImage(slot: SiteImageSlot, sourcePath: string): Promise<string> {
    const isHero = slot === HERO_SLOT;
    const target = isHero ? HERO_STABLE_PATH : path.join('site', randomName());
    return encodeTo(
        sourcePath,
        path.dirname(target),
        path.basename(target),
        isHero ? HERO_MAX_EDGE : MAX_EDGE,
        isHero ? HERO_QUALITY : QUALITY,
    );
}

function randomName(): string {
    return `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.webp`;
}

async function encodeTo(
    sourcePath: string,
    relativeDir: string,
    filename: string,
    maxEdge: number,
    quality: number,
): Promise<string> {
    const pipeline = sharp(sourcePath, { limitInputPixels: MAX_INPUT_PIXELS });

    // Trust the decoded bytes, not the multipart Content-Type the client sent.
    const { format } = await pipeline.metadata().catch(() => {
        throw new UnsupportedImageError();
    });
    if (!format || !ACCEPTED_FORMATS.has(format)) throw new UnsupportedImageError();

    const dir = path.join(UPLOADS_DIR(), relativeDir);
    await mkdir(dir, { recursive: true });

    try {
        await pipeline
            .rotate()
            .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
            .webp({ quality })
            .toFile(path.join(dir, filename));
    } catch (error) {
        // A truncated or corrupt file only fails once sharp reads past the header.
        throw error instanceof Error && /unsupported|corrupt|premature/i.test(error.message)
            ? new UnsupportedImageError()
            : error;
    }

    return `/images/${relativeDir}/${filename}`;
}

/** Removes a multer temp file once it has been processed, successfully or not. */
export async function discardUpload(sourcePath: string): Promise<void> {
    await unlink(sourcePath).catch((error) => logger.warn({ error, sourcePath }, 'Could not remove temporary upload'));
}

const URL_PREFIX = '/images/';

/** True for photos this server wrote into UPLOAD_DIR, false for bundled assets and external links. */
export function isStoredPhoto(url: string): boolean {
    return url.startsWith(URL_PREFIX);
}

/** Only removes files this server wrote; externally linked photos are just dropped from the database. */
export async function removePhotoFile(url: string): Promise<void> {
    if (!isStoredPhoto(url)) return;
    const relative = url.slice(URL_PREFIX.length);
    if (relative.includes('..')) return;
    const root = path.resolve(UPLOADS_DIR());
    const target = path.resolve(root, relative);
    if (!target.startsWith(root + path.sep)) return;
    await unlink(target).catch((error) => logger.warn({ error, url }, 'Could not remove photo file'));
}
