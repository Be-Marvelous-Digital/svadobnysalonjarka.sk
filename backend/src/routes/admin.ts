import { tmpdir } from 'node:os';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { isValidObjectId } from 'mongoose';
import type { CategoryKey } from '../constants.js';
import { env } from '../env.js';
import { clearSession, issueSession, requireAdmin } from '../middleware/auth.js';
import { Photo } from '../models/Photo.js';
import { Reservation } from '../models/Reservation.js';
import { Settings, readSettings } from '../models/Settings.js';
import { User } from '../models/User.js';
import {
    categoryParamSchema,
    loginSchema,
    photoOrderSchema,
    photoUrlSchema,
    reservationPatchSchema,
    settingsSchema,
    weekQuerySchema,
} from '../schemas.js';
import { offeredSlots, weekFrom } from '../services/slots.js';
import { discardUpload, removePhotoFile, storePhoto, UnsupportedImageError } from '../services/photoStorage.js';

export const adminRouter = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.LOGIN_RATE_LIMIT,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Príliš veľa pokusov. Skúste to o chvíľu znova.' },
});

const MAX_FILES = 40;

/**
 * No file-size limit: the salon photographs at full resolution and everything is
 * re-encoded to a bounded WebP anyway. Uploads stream to a temporary file instead
 * of memory, so a large batch cannot exhaust the container's RAM. The temp files
 * are removed in the route, whatever the outcome.
 */
const upload = multer({
    storage: multer.diskStorage({ destination: (_req, _file, cb) => cb(null, tmpdir()) }),
    limits: { files: MAX_FILES },
    // A first cheap filter only; storePhoto decides for real, from the decoded bytes.
    fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});

// Compared against when no such user exists, so a wrong username costs the same time as a wrong password.
const DUMMY_HASH = '$2b$12$uzjIq1J8m0Cr/PDngIzHR.jr7pFcNtge/gzWKe6NkTI45bqMy07T.';

adminRouter.post('/login', loginLimiter, async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(401).json({ error: 'Nesprávne meno alebo heslo.' });
        return;
    }
    const user = await User.findOne({ username: parsed.data.username }).lean();
    const matches = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !matches) {
        res.status(401).json({ error: 'Nesprávne meno alebo heslo.' });
        return;
    }
    issueSession(res, String(user._id));
    res.json({ ok: true });
});

adminRouter.post('/logout', (_req, res) => {
    clearSession(res);
    res.json({ ok: true });
});

adminRouter.get('/me', requireAdmin, (_req, res) => res.json({ ok: true }));

adminRouter.get('/settings', requireAdmin, async (_req, res) => res.json(await readSettings()));

adminRouter.put('/settings', requireAdmin, async (req, res) => {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Neplatné nastavenie.' });
        return;
    }
    await Settings.findOneAndUpdate({ key: 'singleton' }, parsed.data, { upsert: true });
    res.json(parsed.data);
});

adminRouter.get('/reservations', requireAdmin, async (_req, res) => {
    const list = await Reservation.find().sort({ createdAt: -1 }).lean();
    res.json(
        list.map((r) => ({
            id: String(r._id),
            ...splitName(r),
            phone: r.phone,
            email: r.email,
            cat: r.cat,
            date: r.date,
            time: r.time,
            handled: r.handled,
            confirmedDate: r.confirmedDate,
            confirmedTime: r.confirmedTime,
            createdAt: r.createdAt,
        })),
    );
});

adminRouter.patch('/reservations/:id', requireAdmin, async (req, res) => {
    const parsed = reservationPatchSchema.safeParse(req.body);
    if (!parsed.success || !isValidObjectId(req.params.id)) {
        res.status(400).json({ error: 'Neplatná zmena.' });
        return;
    }

    const { handled, confirmedDate, confirmedTime } = parsed.data;

    // The dialog greys taken slots out, but a stale list or a direct request must
    // not be able to put two clients in the same chair.
    if (confirmedDate && confirmedTime) {
        const clash = await Reservation.findOne({
            _id: { $ne: req.params.id },
            confirmedDate,
            confirmedTime,
        }).lean();
        if (clash) {
            res.status(409).json({
                error: `Tento čas je už potvrdený pre ${[clash.firstName, clash.lastName].filter(Boolean).join(' ')}.`,
            });
            return;
        }
    }
    // Confirming a time is what marks an inquiry dealt with; clearing it puts the
    // inquiry back among the new ones.
    const change = confirmedDate
        ? { confirmedDate, confirmedTime, handled: true }
        : confirmedDate === ''
          ? { confirmedDate: '', confirmedTime: '', handled: handled ?? false }
          : { handled: handled ?? false };

    const updated = await Reservation.findByIdAndUpdate(req.params.id, change);
    if (!updated) {
        res.status(404).json({ error: 'Dopyt neexistuje.' });
        return;
    }
    res.json({ ok: true });
});

adminRouter.delete('/reservations/:id', requireAdmin, async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        res.status(400).json({ error: 'Neplatné id.' });
        return;
    }
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
});

/**
 * One week of the salon's diary. Built here rather than in the browser so the
 * opening hours and the fitting length stay in one place.
 */
adminRouter.get('/week', requireAdmin, async (req, res) => {
    const parsed = weekQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: 'Neplatný dátum.' });
        return;
    }

    const dates = weekFrom(parsed.data.from);
    const { duration, buffer } = await readSettings();
    const booked = await Reservation.find({ confirmedDate: { $in: dates } }).lean();

    res.json({
        duration,
        days: dates.map((date) => ({
            date,
            slots: offeredSlots(date, duration, buffer).map((time) => {
                const match = booked.find((r) => r.confirmedDate === date && r.confirmedTime === time);
                return {
                    time,
                    booked: match
                        ? {
                              id: String(match._id),
                              firstName: match.firstName,
                              lastName: match.lastName,
                              phone: match.phone,
                              cat: match.cat,
                          }
                        : null,
                };
            }),
        })),
    });
});

adminRouter.get('/photos', requireAdmin, async (_req, res) => {
    const photos = await Photo.find().sort({ category: 1, order: 1, createdAt: 1 }).lean();
    res.json(photos.map((p) => ({ id: String(p._id), category: p.category, url: p.url })));
});

/** Tolerates records written before the name was split into two fields. */
function splitName(record: { firstName?: string; lastName?: string; name?: string }): {
    firstName: string;
    lastName: string;
} {
    if (record.firstName) return { firstName: record.firstName, lastName: record.lastName ?? '' };
    const [first = '', ...rest] = (record.name ?? '').trim().split(/\s+/);
    return { firstName: first, lastName: rest.join(' ') };
}

async function nextOrder(category: CategoryKey): Promise<number> {
    const last = await Photo.findOne({ category }).sort({ order: -1 }).select('order').lean();
    return (last?.order ?? -1) + 1;
}

adminRouter.post('/photos/:category', requireAdmin, upload.array('photos', MAX_FILES), async (req, res) => {
    const parsed = categoryParamSchema.safeParse(req.params);
    if (!parsed.success) {
        res.status(400).json({ error: 'Neznáma kategória.' });
        return;
    }
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) {
        res.status(400).json({ error: 'Nevybrali ste žiadnu fotografiu.' });
        return;
    }
    const { category } = parsed.data;
    let order = await nextOrder(category);
    const created = [];

    try {
        for (const file of files) {
            let url: string;
            try {
                url = await storePhoto(category, file.path);
            } catch (error) {
                if (error instanceof UnsupportedImageError) {
                    res.status(400).json({ error: error.message });
                    return;
                }
                throw error;
            }
            try {
                const doc = await Photo.create({ category, url, order: order++ });
                created.push({ id: String(doc._id), category, url });
            } catch (error) {
                // The file is already on the volume; without this the write would be orphaned there.
                await removePhotoFile(url);
                throw error;
            }
        }
    } finally {
        await Promise.all(files.map((file) => discardUpload(file.path)));
    }

    res.status(201).json(created);
});

adminRouter.put('/photos/:id', requireAdmin, upload.single('photo'), async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        res.status(400).json({ error: 'Neplatné id.' });
        return;
    }
    if (!req.file) {
        res.status(400).json({ error: 'Nevybrali ste žiadnu fotografiu.' });
        return;
    }
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
        res.status(404).json({ error: 'Fotografia neexistuje.' });
        return;
    }

    const previousUrl = photo.url;
    let url: string;
    try {
        url = await storePhoto(photo.category as CategoryKey, req.file.path);
    } catch (error) {
        if (error instanceof UnsupportedImageError) {
            res.status(400).json({ error: error.message });
            return;
        }
        throw error;
    } finally {
        await discardUpload(req.file.path);
    }
    try {
        photo.url = url;
        await photo.save();
    } catch (error) {
        await removePhotoFile(url);
        throw error;
    }
    await removePhotoFile(previousUrl);

    res.json({ id: String(photo._id), category: photo.category, url });
});

adminRouter.put('/photos/:category/order', requireAdmin, async (req, res) => {
    const params = categoryParamSchema.safeParse(req.params);
    const body = photoOrderSchema.safeParse(req.body);
    if (!params.success || !body.success || body.data.ids.some((id) => !isValidObjectId(id))) {
        res.status(400).json({ error: 'Neplatné poradie.' });
        return;
    }

    const { category } = params.data;
    const { ids } = body.data;

    // The request has to carry the whole category. Anything else means the client
    // was working from a stale list, and applying it would scramble the order.
    const existing = await Photo.find({ category }).select('_id').lean();
    const known = new Set(existing.map((photo) => String(photo._id)));
    const unique = new Set(ids);
    if (unique.size !== ids.length || ids.length !== known.size || ids.some((id) => !known.has(id))) {
        res.status(409).json({ error: 'Zoznam fotografií sa medzičasom zmenil. Obnovte stránku.' });
        return;
    }

    await Photo.bulkWrite(ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: index } } } })));
    res.json({ ok: true });
});

adminRouter.post('/photos/:category/link', requireAdmin, async (req, res) => {
    const params = categoryParamSchema.safeParse(req.params);
    const body = photoUrlSchema.safeParse(req.body);
    if (!params.success || !body.success) {
        res.status(400).json({ error: 'Neplatný odkaz na fotografiu.' });
        return;
    }
    const { category } = params.data;
    const doc = await Photo.create({ category, url: body.data.url, order: await nextOrder(category) });
    res.status(201).json({ id: String(doc._id), category, url: doc.url });
});

adminRouter.delete('/photos/:id', requireAdmin, async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        res.status(400).json({ error: 'Neplatné id.' });
        return;
    }
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (photo) await removePhotoFile(photo.url);
    res.json({ ok: true });
});
