import { useEffect, useState } from 'react';
import { apiGet } from '@/api/client';
import type { Gallery } from '@/api/types';
import { CATEGORY_KEYS, type CategoryKey } from '@/data/collections';

const EMPTY: Gallery = CATEGORY_KEYS.reduce((accumulator, key) => ({ ...accumulator, [key]: [] }), {} as Gallery);

interface GalleryState {
    gallery: Gallery;
    loading: boolean;
}

/**
 * The whole gallery arrives in one response and every collection reads its own
 * slice out of it, so the fetch is shared for the session: clicking through the
 * chips would otherwise refetch the same document once per collection. An
 * in-flight promise is cached too, so mounting two consumers at once asks once.
 */
let cached: Gallery | null = null;
let inFlight: Promise<Gallery> | null = null;

function loadGallery(): Promise<Gallery> {
    if (cached) return Promise.resolve(cached);
    inFlight ??= apiGet<Gallery>('/gallery')
        .then((data) => {
            cached = { ...EMPTY, ...data };
            return cached;
        })
        .finally(() => {
            inFlight = null;
        });
    return inFlight;
}

export function useGallery(): GalleryState {
    const [gallery, setGallery] = useState<Gallery>(() => cached ?? EMPTY);
    const [loading, setLoading] = useState(() => cached === null);

    useEffect(() => {
        if (cached) return;

        let active = true;
        loadGallery()
            .then((data) => {
                if (active) setGallery(data);
            })
            .catch(() => undefined)
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    return { gallery, loading };
}

export function photosOf(gallery: Gallery, key: CategoryKey): string[] {
    return gallery[key] ?? [];
}
