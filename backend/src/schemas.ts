import { z } from 'zod';
import { CATEGORY_KEYS } from './constants.js';

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

/** The only thing the owner changes about an inquiry. */
export const reservationPatchSchema = z.object({
    handled: z.boolean(),
});

export const settingsSchema = z.object({
    duration: z.number().int().min(15).max(240),
    buffer: z.number().int().min(0).max(120),
});

export const loginSchema = z.object({
    username: z.string().trim().toLowerCase().min(1).max(60),
    password: z.string().min(1).max(200),
});

const password = z
    .string()
    .min(10, 'Heslo musí mať aspoň 10 znakov')
    .max(200)
    .refine((value) => /[a-z]/i.test(value) && /\d/.test(value), 'Heslo musí obsahovať písmeno aj číslicu');

export const createUserSchema = z.object({
    username: z
        .string()
        .trim()
        .toLowerCase()
        .min(3)
        .max(60)
        .regex(/^[a-z0-9._-]+$/, 'Meno môže obsahovať len písmená bez diakritiky, číslice, bodku, pomlčku a podčiarkovník'),
    password,
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1).max(200),
    newPassword: password,
});

export const resetPasswordSchema = z.object({ password });

/** The full, final order for one category. Partial lists are rejected on purpose. */
export const photoOrderSchema = z.object({
    ids: z.array(z.string()).min(1).max(500),
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
