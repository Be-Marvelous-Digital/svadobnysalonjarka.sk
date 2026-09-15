import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { isValidObjectId } from 'mongoose';
import { env } from '../env.js';
import { User } from '../models/User.js';

declare module 'express-serve-static-core' {
    interface Request {
        /** Set by requireAdmin: the id of the signed-in user. */
        adminId?: string;
    }
}

export const SESSION_COOKIE = 'jarka_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;
/** Pinned so a token can never talk the verifier into a different algorithm. */
const ALGORITHM = 'HS256';

export function issueSession(res: Response, userId: string): void {
    const token = jwt.sign({ role: 'admin', sub: userId }, env.JWT_SECRET, {
        algorithm: ALGORITHM,
        expiresIn: SESSION_TTL_SECONDS,
    });
    res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: 'strict',
        path: '/',
        maxAge: SESSION_TTL_SECONDS * 1000,
    });
}

export function clearSession(res: Response): void {
    res.clearCookie(SESSION_COOKIE, { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: 'strict', path: '/' });
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) {
        res.status(401).json({ error: 'Neprihlásený' });
        return;
    }

    let adminId: string;
    try {
        const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] }) as { role?: string; sub?: string };
        if (payload.role !== 'admin' || !payload.sub || !isValidObjectId(payload.sub)) throw new Error('wrong role');
        adminId = payload.sub;
    } catch {
        res.status(401).json({ error: 'Neplatná relácia' });
        return;
    }

    // The token alone is not enough: a deleted account would otherwise keep its
    // access until the token expired, hours after it was revoked.
    if (!(await User.exists({ _id: adminId }))) {
        clearSession(res);
        res.status(401).json({ error: 'Neplatná relácia' });
        return;
    }

    req.adminId = adminId;
    next();
}
