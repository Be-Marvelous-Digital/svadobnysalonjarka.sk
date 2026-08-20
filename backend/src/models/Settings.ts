import { Schema, model } from 'mongoose';
import { DEFAULT_SETTINGS } from '../constants.js';

const settingsSchema = new Schema({
    key: { type: String, default: 'singleton', unique: true },
    duration: { type: Number, default: DEFAULT_SETTINGS.duration, min: 15, max: 240 },
    buffer: { type: Number, default: DEFAULT_SETTINGS.buffer, min: 0, max: 120 },
});

export const Settings = model('Settings', settingsSchema);

export async function readSettings(): Promise<{ duration: number; buffer: number }> {
    const doc = await Settings.findOneAndUpdate(
        { key: 'singleton' },
        { $setOnInsert: DEFAULT_SETTINGS },
        { upsert: true, new: true },
    ).lean();
    return { duration: doc?.duration ?? DEFAULT_SETTINGS.duration, buffer: doc?.buffer ?? DEFAULT_SETTINGS.buffer };
}
