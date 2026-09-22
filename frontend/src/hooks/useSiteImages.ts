import { useEffect, useState } from 'react';
import { apiGet } from '@/api/client';
import type { SiteImages } from '@/data/siteImages';

const EMPTY: SiteImages = {};

/**
 * Overridden positions arrive in one small document that almost every page reads,
 * so the fetch is shared for the session the way the gallery is. A failure leaves
 * the map empty, which renders the bundled photos — the site is never without one.
 */
let cached: SiteImages | null = null;
let inFlight: Promise<SiteImages> | null = null;

function loadSiteImages(): Promise<SiteImages> {
    if (cached) return Promise.resolve(cached);
    inFlight ??= apiGet<SiteImages>('/site-images')
        .then((data) => {
            cached = data;
            return cached;
        })
        .finally(() => {
            inFlight = null;
        });
    return inFlight;
}

/** Drops the cache so a change made in the admin shows without a reload. */
export function invalidateSiteImages(): void {
    cached = null;
}

export function useSiteImages(): SiteImages {
    const [images, setImages] = useState<SiteImages>(() => cached ?? EMPTY);

    useEffect(() => {
        if (cached) return;

        let active = true;
        loadSiteImages()
            .then((data) => {
                if (active) setImages(data);
            })
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, []);

    return images;
}
