import { Schema, model, type InferSchemaType } from 'mongoose';
import { RESERVATION_KINDS, RESERVATION_STATUSES } from '../constants.js';

const reservationSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 120 },
        phone: { type: String, default: '', trim: true, maxlength: 40 },
        email: { type: String, default: '', trim: true, maxlength: 160 },
        cat: { type: String, default: '', trim: true, maxlength: 60 },
        note: { type: String, default: '', trim: true, maxlength: 400 },
        date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
        time: { type: String, required: true, match: /^\d{1,2}:\d{2}$/ },
        status: { type: String, enum: RESERVATION_STATUSES, default: 'pending', index: true },
        kind: { type: String, enum: RESERVATION_KINDS, default: 'klient' },
        altDate: { type: String, default: '' },
        altTime: { type: String, default: '' },
    },
    { timestamps: true },
);

reservationSchema.index({ date: 1, time: 1 });

export type ReservationDoc = InferSchemaType<typeof reservationSchema>;

export const Reservation = model('Reservation', reservationSchema);
