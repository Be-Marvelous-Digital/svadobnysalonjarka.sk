import { Schema, model, type InferSchemaType } from 'mongoose';
import { SITE_IMAGE_SLOTS } from '../constants.js';

/**
 * One row per overridden position. A slot with no row renders the photo bundled
 * with the frontend, so "reset to the original" is a delete rather than a write.
 */
const siteImageSchema = new Schema(
    {
        slot: { type: String, enum: SITE_IMAGE_SLOTS, required: true, unique: true },
        url: { type: String, required: true },
    },
    { timestamps: true },
);

export type SiteImageDoc = InferSchemaType<typeof siteImageSchema>;

export const SiteImage = model('SiteImage', siteImageSchema);

/** Slot to URL for every override that exists; slots left at their default are absent. */
export async function readSiteImages(): Promise<Record<string, string>> {
    const rows = await SiteImage.find().select('slot url').lean();
    return Object.fromEntries(rows.map((row) => [row.slot, row.url]));
}
