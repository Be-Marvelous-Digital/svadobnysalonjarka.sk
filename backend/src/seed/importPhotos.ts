import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { connectDatabase, disconnectDatabase } from '../db.js';
import { logger } from '../logger.js';
import { Photo } from '../models/Photo.js';
import { SiteImage } from '../models/SiteImage.js';
import { isStoredPhoto, removePhotoFile, storePhoto, UnsupportedImageError } from '../services/photoStorage.js';
import type { CategoryKey } from '../constants.js';

/**
 * Bulk import of the salon's own photo folders.
 *
 * Each folder maps to one category. Files go through the same pipeline an admin
 * upload does — resized, re-encoded to WebP, written into UPLOAD_DIR — so the
 * result is indistinguishable from photos added through the browser, and the
 * volume can simply be copied to the server.
 *
 *   npm run import:photos -- ../foto
 *   npm run import:photos -- ../foto svadobne_saty
 */
const FOLDER_TO_CATEGORY: Record<string, CategoryKey> = {
    svadobne_saty: 'svadobne',
    spolocenske_saty: 'spolocenske',
    saty_na_prijmanie: 'prijimacie',
    topanky_kabelky: 'obuv',
};

const IMAGE = /\.(webp|jpe?g|png|avif|tiff?|heic|heif)$/i;

async function importFolder(root: string, folder: string, category: CategoryKey): Promise<void> {
    const dir = path.join(root, folder);
    const names = (await readdir(dir)).filter((name) => IMAGE.test(name)).sort((a, b) => a.localeCompare(b, 'sk'));

    if (names.length === 0) {
        logger.warn(`${folder}: no images, skipped`);
        return;
    }

    // Replacing rather than appending: re-running the import must not double the
    // category. Files this server wrote are removed with their rows.
    const existing = await Photo.find({ category }).select('url').lean();
    await Photo.deleteMany({ category });
    for (const photo of existing) {
        if (isStoredPhoto(photo.url)) await removePhotoFile(photo.url);
    }

    let order = 0;
    let failed = 0;
    for (const name of names) {
        try {
            const url = await storePhoto(category, path.join(dir, name));
            await Photo.create({ category, url, order: order++ });
        } catch (error) {
            failed++;
            logger.warn({ name, error: error instanceof UnsupportedImageError ? error.message : error }, 'skipped');
        }
    }

    // A slot may have pointed at a photo that has just been replaced.
    const live = await Photo.find({ category }).select('url').lean();
    const urls = new Set(live.map((photo) => photo.url));
    const stale = await SiteImage.find().select('slot url').lean();
    for (const slot of stale) {
        if (slot.url.startsWith(`/images/gallery/${category}/`) && !urls.has(slot.url)) {
            await SiteImage.deleteOne({ slot: slot.slot });
            logger.info(`slot ${slot.slot} reset: the photo it used is gone`);
        }
    }

    logger.info(`${folder} → ${category}: ${order} imported${failed ? `, ${failed} skipped` : ''}`);
}

async function run(): Promise<void> {
    const [root, only] = process.argv.slice(2);
    if (!root) throw new Error('Usage: npm run import:photos -- <folder> [subfolder]');
    if (!(await stat(root)).isDirectory()) throw new Error(`${root} is not a directory`);

    const folders = Object.keys(FOLDER_TO_CATEGORY).filter((folder) => !only || folder === only);
    if (folders.length === 0) throw new Error(`Unknown folder "${only}". Known: ${Object.keys(FOLDER_TO_CATEGORY).join(', ')}`);

    await connectDatabase();
    try {
        for (const folder of folders) {
            const category = FOLDER_TO_CATEGORY[folder];
            if (category) await importFolder(root, folder, category);
        }
    } finally {
        await disconnectDatabase();
    }
}

run().catch((error) => {
    logger.error({ error }, 'Import failed');
    process.exit(1);
});
