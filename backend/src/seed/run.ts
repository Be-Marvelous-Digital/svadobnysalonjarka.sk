import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../db.js';
import type { CategoryKey } from '../constants.js';
import { env } from '../env.js';
import { Photo } from '../models/Photo.js';
import { purgeDateFor, Reservation } from '../models/Reservation.js';
import { readSettings } from '../models/Settings.js';
import { User } from '../models/User.js';
import { logger } from '../logger.js';

/** Photos shipped inside the frontend bundle; uploads added later live under /images/gallery/. */
const BUNDLED: Record<CategoryKey, string[]> = {
    svadobne: ['svadobne-1', 'svadobne-2', 'svadobne-3', 'svadobne-4', 'svadobne-5'],
    spolocenske: ['spolocenske-1', 'spolocenske-2', 'spolocenske-3', 'spolocenske-4'],
    prijimacie: ['prijimacie-1', 'prijimacie-2'],
    zenich: ['zenich-1', 'zenich-2', 'zenich-3', 'zenich-4', 'zenich-5'],
    obuv: ['obuv-1', 'obuv-2', 'obuv-3', 'obuv-4', 'obuv-5', 'obuv-6', 'obuv-7'],
    galeria: ['hero', 'svadobne-1', 'svadobne-3', 'spolocenske-2', 'prijimacie-1'],
    // Feeds the Instagram strip on the home page.
    instagram: ['svadobne-3', 'spolocenske-2', 'svadobne-4', 'spolocenske-3', 'svadobne-5', 'prijimacie-2'],
    // Fills the About page: the first photo is the portrait, the rest the band below it.
    osalone: ['svadobne-4', 'svadobne-5', 'spolocenske-4', 'prijimacie-1', 'hero'],
    // No bundled photos yet; the salon uploads its own of the venue.
    priestor: [],
};

/** Creates the admin account on first run; an existing account is never overwritten by a re-seed. */
async function seedAdmin(): Promise<void> {
    const username = env.ADMIN_USERNAME.toLowerCase();
    const existing = await User.findOne({ username });
    if (existing) {
        logger.info(`Admin user "${username}" already exists, left untouched`);
        return;
    }
    await User.create({ username, passwordHash: await bcrypt.hash(env.ADMIN_PASSWORD, 12), role: 'admin' });
    logger.info(`Created admin user "${username}" — change the password before going live`);
}

/** Moves pre-split records onto firstName/lastName. Safe to run repeatedly. */
async function splitLegacyNames(): Promise<void> {
    const legacy = await Reservation.find({ firstName: { $in: [null, ''] }, name: { $nin: [null, ''] } }).lean();
    for (const record of legacy) {
        const [firstName = '', ...rest] = String(record.name).trim().split(/\s+/);
        await Reservation.updateOne({ _id: record._id }, { $set: { firstName, lastName: rest.join(' ') }, $unset: { name: '' } });
    }
    if (legacy.length > 0) logger.info(`Split ${legacy.length} legacy name(s) into firstName/lastName`);
}

/**
 * Gives records written before retention was enforced a purge date, so the TTL
 * index covers them too. Safe to run repeatedly.
 */
async function backfillPurgeDates(): Promise<void> {
    const missing = await Reservation.find({ purgeAfter: { $exists: false } })
        .select('date confirmedDate')
        .lean();
    for (const record of missing) {
        await Reservation.updateOne(
            { _id: record._id },
            { $set: { purgeAfter: purgeDateFor(record.date, record.confirmedDate) } },
        );
    }
    if (missing.length > 0) logger.info(`Backfilled a purge date on ${missing.length} reservation(s)`);
}

async function main(): Promise<void> {
    await connectDatabase();
    await splitLegacyNames();
    await backfillPurgeDates();
    await readSettings();
    await seedAdmin();

    for (const [category, names] of Object.entries(BUNDLED) as Array<[CategoryKey, string[]]>) {
        // A category holding real uploads has outgrown the samples. Re-seeding
        // would drop the bundled stock back in among the salon's own photos.
        const uploaded = await Photo.countDocuments({ category, url: { $regex: '^/images/' } });
        if (uploaded > 0) {
            logger.info(`${category}: ${uploaded} uploaded photo(s), bundled samples skipped`);
            continue;
        }

        let order = 0;
        for (const name of names) {
            const url = `/assets/${name}.webp`;
            await Photo.findOneAndUpdate(
                { category, url },
                { $setOnInsert: { category, url, order: order++ } },
                { upsert: true },
            );
        }
        logger.info(`Seeded ${names.length} photos for ${category}`);
    }

    await disconnectDatabase();
}

main().catch((error) => {
    logger.error({ error }, 'Seed failed');
    process.exit(1);
});
