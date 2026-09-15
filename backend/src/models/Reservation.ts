import { Schema, model, type InferSchemaType } from 'mongoose';

const reservationSchema = new Schema(
    {
        firstName: { type: String, required: true, trim: true, maxlength: 60 },
        lastName: { type: String, default: '', trim: true, maxlength: 60 },
        /** Pre-split records. Read-only; splitLegacyNames moves it into the pair above. */
        name: { type: String, default: '', trim: true, maxlength: 120 },
        phone: { type: String, default: '', trim: true, maxlength: 40 },
        email: { type: String, default: '', trim: true, maxlength: 160 },
        cat: { type: String, default: '', trim: true, maxlength: 60 },
        date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
        time: { type: String, required: true, match: /^\d{1,2}:\d{2}$/ },
        /** Ticked off by the owner once the client has been dealt with. */
        handled: { type: Boolean, default: false, index: true },
        /** What was actually agreed, which need not be what was requested. */
        confirmedDate: { type: String, default: '', match: /^(\d{4}-\d{2}-\d{2})?$/ },
        confirmedTime: { type: String, default: '', match: /^(\d{1,2}:\d{2})?$/ },
    },
    { timestamps: true },
);

reservationSchema.index({ createdAt: -1 });
reservationSchema.index({ confirmedDate: 1, confirmedTime: 1 });

export type ReservationDoc = InferSchemaType<typeof reservationSchema>;

export const Reservation = model('Reservation', reservationSchema);
