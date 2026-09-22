import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiGet, apiSend, apiUpload } from '@/api/client';
import type { SiteImages, SiteImageSlot } from '@/data/siteImages';
import { invalidateSiteImages } from './useSiteImages';

export interface AdminSiteImagesApi {
    images: SiteImages;
    busy: SiteImageSlot | null;
    error: string;
    /** Uploads a replacement, which is re-encoded server side like a gallery photo. */
    upload: (slot: SiteImageSlot, file: File) => Promise<void>;
    /** Points the slot at a photo already stored, so the file is not held twice. */
    choose: (slot: SiteImageSlot, url: string) => Promise<void>;
    /** Drops the override; the site goes back to the photo it ships with. */
    reset: (slot: SiteImageSlot) => Promise<void>;
}

export function useAdminSiteImages(): AdminSiteImagesApi {
    const [images, setImages] = useState<SiteImages>({});
    const [busy, setBusy] = useState<SiteImageSlot | null>(null);
    const [error, setError] = useState('');

    const refresh = useCallback(async () => {
        setImages(await apiGet<SiteImages>('/admin/site-images'));
    }, []);

    useEffect(() => {
        refresh().catch(() => setError('Fotografie sa nepodarilo načítať.'));
    }, [refresh]);

    const run = useCallback(
        async (slot: SiteImageSlot, action: () => Promise<unknown>) => {
            setBusy(slot);
            setError('');
            try {
                await action();
                await refresh();
                // The public pages cache this document for the session; without
                // this they would keep showing the previous photo until a reload.
                invalidateSiteImages();
            } catch (caught) {
                setError(caught instanceof ApiError ? caught.message : 'Zmena sa nepodarila.');
            } finally {
                setBusy(null);
            }
        },
        [refresh],
    );

    const upload = useCallback(
        (slot: SiteImageSlot, file: File) =>
            run(slot, () => {
                const form = new FormData();
                form.append('photo', file);
                return apiUpload(`/admin/site-images/${slot}`, form, 'PUT');
            }),
        [run],
    );

    const choose = useCallback(
        (slot: SiteImageSlot, url: string) => run(slot, () => apiSend('PUT', `/admin/site-images/${slot}`, { url })),
        [run],
    );

    const reset = useCallback((slot: SiteImageSlot) => run(slot, () => apiSend('DELETE', `/admin/site-images/${slot}`)), [run]);

    return { images, busy, error, upload, choose, reset };
}
