import { Schema, model, type InferSchemaType } from 'mongoose';

const reservationSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 120 },
        phone: { type: String, default: '', trim: true, maxlength: 40 },
        email: { type: String, default: '', trim: true, maxlength: 160 },
        cat: { type: String, default: '', trim: true, maxlength: 60 },
        date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
        time: { type: String, required: true, match: /^\d{1,2}:\d{2}$/ },
        /** Ticked off by the owner once the client has been dealt with. */
        handled: { type: Boolean, default: false, index: true },
    },
    { timestamps: true },
);

reservationSchema.index({ createdAt: -1 });

export type ReservationDoc = InferSchemaType<typeof reservationSchema>;

export const Reservation = model('Reservation', reservationSchema);
