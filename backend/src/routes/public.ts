import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { CATEGORY_KEYS, type CategoryKey } from '../constants.js';
import { env } from '../env.js';
import { Photo } from '../models/Photo.js';
import { Reservation } from '../models/Reservation.js';
import { readSettings } from '../models/Settings.js';
import { readSiteImages } from '../models/SiteImage.js';
import { availabilityQuerySchema, reservationRequestSchema } from '../schemas.js';
import { forwardInquiry } from '../services/mailchimp.js';
import { offeredSlots } from '../services/slots.js';

export const publicRouter = Router();

const reservationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: env.RESERVATION_RATE_LIMIT,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Príliš veľa žiadostí. Skúste to, prosím, neskôr alebo nám zavolajte.' },
});

publicRouter.get('/gallery', async (_req, res) => {
    const photos = await Photo.find().sort({ category: 1, order: 1, createdAt: 1 }).select('category url').lean();
    const grouped = Object.fromEntries(CATEGORY_KEYS.map((key) => [key, [] as string[]])) as Record<CategoryKey, string[]>;
    for (const photo of photos) grouped[photo.category as CategoryKey]?.push(photo.url);
    res.json(grouped);
});

/** Only the positions the salon has overridden; the frontend renders its own photo for the rest. */
publicRouter.get('/site-images', async (_req, res) => {
    res.json(await readSiteImages());
});

publicRouter.get('/availability', async (req, res) => {
    const parsed = availabilityQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: 'Neplatný dátum' });
        return;
    }
    const { duration, buffer } = await readSettings();
    res.json({ date: parsed.data.date, duration, slots: offeredSlots(parsed.data.date, duration, buffer) });
});

publicRouter.post('/reservations', reservationLimiter, async (req, res) => {
    const parsed = reservationRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Skontrolujte, prosím, vyplnené údaje.' });
        return;
    }
    const { duration, buffer } = await readSettings();
    const { date, time } = parsed.data;

    // Still refused when the salon is shut or the time is not one it offers; never
    // because somebody else asked about it first.
    if (!offeredSlots(date, duration, buffer).includes(time)) {
        res.status(409).json({ error: 'V tento čas neskúšame. Vyberte, prosím, niektorý z ponúkaných termínov.' });
        return;
    }

    await Reservation.create(parsed.data);

    // Answer the visitor first. The forward is best-effort and must never delay or
    // fail a booking that is already saved.
    res.status(201).json({ ok: true });
    void forwardInquiry(parsed.data);
});
