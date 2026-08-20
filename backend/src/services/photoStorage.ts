import { randomBytes } from 'node:crypto';
import { mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { env } from '../env.js';
import { logger } from '../logger.js';
import type { CategoryKey } from '../constants.js';

const GALLERY_DIR = () => path.join(env.UPLOAD_DIR, 'gallery');
const MAX_EDGE = 1600;

export async function storePhoto(category: CategoryKey, buffer: Buffer): Promise<string> {
    const dir = path.join(GALLERY_DIR(), category);
    await mkdir(dir, { recursive: true });
    const filename = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.webp`;
    await sharp(buffer)
        .rotate()
        .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(path.join(dir, filename));
    return `/images/gallery/${category}/${filename}`;
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
