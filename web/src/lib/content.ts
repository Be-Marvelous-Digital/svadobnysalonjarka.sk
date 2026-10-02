import type { Gallery } from '@/api/types';
import { CATEGORY_KEYS } from '@/data/collections';
import type { SiteImages } from '@/data/siteImages';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://localhost:4000';
const REVALIDATE_SECONDS = 300;

export const CONTENT_TAGS = { gallery: 'gallery', siteImages: 'site-images' } as const;

const EMPTY_GALLERY = CATEGORY_KEYS.reduce((accumulator, key) => ({ ...accumulator, [key]: [] }), {} as Gallery);

const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';

async function fetchJson<T>(path: string, tag: string): Promise<T | null> {
    try {
        const response = await fetch(`${API_ORIGIN}/api${path}`, { next: { revalidate: REVALIDATE_SECONDS, tags: [tag] } });
        if (!response.ok) throw new Error(`API ${path} answered ${response.status}`);
        return (await response.json()) as T;
    } catch (error) {
        // At runtime a throw keeps the last good ISR copy; the build has no API, so it renders fallbacks.
        if (IS_BUILD) return null;
        throw error;
    }
}

export async function getGallery(): Promise<Gallery> {
    const data = await fetchJson<Partial<Gallery>>('/gallery', CONTENT_TAGS.gallery);
    return { ...EMPTY_GALLERY, ...data };
}

export async function getSiteImages(): Promise<SiteImages> {
    return (await fetchJson<SiteImages>('/site-images', CONTENT_TAGS.siteImages)) ?? {};
}
