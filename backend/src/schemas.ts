import { z } from 'zod';
import { CATEGORY_KEYS, RESERVATION_STATUSES } from './constants.js';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Neplatný dátum');
const timeString = z.string().regex(/^\d{1,2}:\d{2}$/, 'Neplatný čas');

export const reservationRequestSchema = z.object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(6).max(40),
    email: z.email().max(160),
    cat: z.string().trim().min(1).max(60),
    date: dateString,
    time: timeString,
});

export const ownerReservationSchema = z.object({
    name: z.string().trim().min(1).max(120),
    phone: z.string().trim().max(40).default(''),
    email: z.string().trim().max(160).default(''),
    cat: z.string().trim().max(60).default(''),
    note: z.string().trim().max(400).default(''),
    date: dateString,
    time: timeString,
    kind: z.enum(['majitelka', 'blok']),
});

export const reservationPatchSchema = z
    .object({
        status: z.enum(RESERVATION_STATUSES).optional(),
        altDate: z.union([dateString, z.literal('')]).optional(),
        altTime: z.union([timeString, z.literal('')]).optional(),
    })
    .refine((v) => Object.keys(v).length > 0, 'Žiadne zmeny');

export const settingsSchema = z.object({
    duration: z.number().int().min(15).max(240),
    buffer: z.number().int().min(0).max(120),
});

export const loginSchema = z.object({
    username: z.string().trim().toLowerCase().min(1).max(60),
    password: z.string().min(1).max(200),
});

export const categoryParamSchema = z.object({
    category: z.enum(CATEGORY_KEYS),
});

export const availabilityQuerySchema = z.object({
    date: dateString,
});

export const photoUrlSchema = z.object({
    // z.url() alone accepts javascript: and data:, which have no business in an <img src>.
    url: z
        .url()
        .max(600)
        .refine((value) => /^https?:\/\//i.test(value), 'Odkaz musí začínať http:// alebo https://'),
});
