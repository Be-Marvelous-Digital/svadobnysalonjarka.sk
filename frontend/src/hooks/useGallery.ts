import { useEffect, useState } from 'react';
import { apiGet } from '@/api/client';
import type { Gallery } from '@/api/types';
import { CATEGORY_KEYS, type CategoryKey } from '@/data/collections';

const EMPTY: Gallery = CATEGORY_KEYS.reduce((accumulator, key) => ({ ...accumulator, [key]: [] }), {} as Gallery);

interface GalleryState {
    gallery: Gallery;
    loading: boolean;
}

export function useGallery(): GalleryState {
    const [gallery, setGallery] = useState<Gallery>(EMPTY);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        apiGet<Gallery>('/gallery')
            .then((data) => {
                if (active) setGallery({ ...EMPTY, ...data });
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
