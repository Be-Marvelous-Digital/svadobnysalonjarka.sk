import { Schema, model, type InferSchemaType } from 'mongoose';
import { CATEGORY_KEYS } from '../constants.js';

const photoSchema = new Schema(
    {
        category: { type: String, enum: CATEGORY_KEYS, required: true, index: true },
        url: { type: String, required: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true },
);

photoSchema.index({ category: 1, order: 1 });

export type PhotoDoc = InferSchemaType<typeof photoSchema>;

export const Photo = model('Photo', photoSchema);
