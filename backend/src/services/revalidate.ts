import type { RequestHandler } from 'express';
import { env } from '../env.js';
import { logger } from '../logger.js';

type ContentTag = 'gallery' | 'site-images';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function tagFor(path: string): ContentTag | null {
    if (path.startsWith('/photos')) return 'gallery';
    if (path.startsWith('/site-images')) return 'site-images';
    return null;
}

export async function revalidateContent(tag: ContentTag): Promise<void> {
    if (!env.WEB_REVALIDATE_URL || !env.REVALIDATE_SECRET) return;
    try {
        const response = await fetch(env.WEB_REVALIDATE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': env.REVALIDATE_SECRET },
            body: JSON.stringify({ tag }),
            signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) logger.warn({ tag, status: response.status }, 'Revalidation refused');
    } catch (error) {
        logger.warn({ tag, err: error }, 'Revalidation failed');
    }
}

/** Tells the public site to drop its cached pages once an admin change has succeeded. */
export const revalidateOnChange: RequestHandler = (req, res, next) => {
    const tag = MUTATING.has(req.method) ? tagFor(req.path) : null;
    if (tag) {
        res.on('finish', () => {
            if (res.statusCode < 400) void revalidateContent(tag);
        });
    }
    next();
};
