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
        /**
         * When this record stops being kept. The privacy policy promises twelve
         * months after the fitting, and a promise nothing enforces is just words;
         * the TTL index below is what actually does the deleting.
         */
        purgeAfter: { type: Date, required: true },
    },
    { timestamps: true },
);

/** Months the policy says an inquiry is kept for, counted from the fitting date. */
export const RETENTION_MONTHS = 12;

/** The date a record should disappear on, from whichever date currently applies. */
export function purgeDateFor(date: string, confirmedDate?: string): Date {
    const basis = new Date(`${confirmedDate || date}T12:00:00Z`);
    const when = Number.isNaN(basis.getTime()) ? new Date() : basis;
    return new Date(when.setMonth(when.getMonth() + RETENTION_MONTHS));
}

// Mongo drops the document itself once this passes, so retention does not depend
// on anyone remembering to run a cleanup.
// Set from the record itself, so no caller can create one that is kept forever.
// Updates through findByIdAndUpdate bypass document middleware and set it there.
reservationSchema.pre('validate', function setPurgeDate() {
    this.purgeAfter = purgeDateFor(this.date, this.confirmedDate);
});

reservationSchema.index({ purgeAfter: 1 }, { expireAfterSeconds: 0 });
reservationSchema.index({ createdAt: -1 });
reservationSchema.index({ confirmedDate: 1, confirmedTime: 1 });

export type ReservationDoc = InferSchemaType<typeof reservationSchema>;

export const Reservation = model('Reservation', reservationSchema);
