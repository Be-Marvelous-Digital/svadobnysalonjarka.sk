import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiGet, apiSend, apiUpload } from '@/api/client';
import type { AdminPhoto } from '@/api/types';
import type { CategoryKey } from '@/data/collections';

export function useAdminGallery() {
    const [photos, setPhotos] = useState<AdminPhoto[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const refresh = useCallback(async () => {
        setPhotos(await apiGet<AdminPhoto[]>('/admin/photos'));
    }, []);

    useEffect(() => {
        refresh().catch(() => undefined);
    }, [refresh]);

    const run = useCallback(
        async (action: () => Promise<unknown>) => {
            setBusy(true);
            try {
                await action();
                setError('');
                await refresh();
            } catch (caught) {
                setError(caught instanceof ApiError ? caught.message : 'Operácia zlyhala.');
            } finally {
                setBusy(false);
            }
        },
        [refresh],
    );

    const upload = useCallback(
        (category: CategoryKey, files: FileList) =>
            run(() => {
                const form = new FormData();
                for (const file of Array.from(files)) form.append('photos', file);
                return apiUpload(`/admin/photos/${category}`, form);
            }),
        [run],
    );

    const addLink = useCallback(
        (category: CategoryKey, url: string) => run(() => apiSend('POST', `/admin/photos/${category}/link`, { url })),
        [run],
    );

    const replace = useCallback(
        (id: string, file: File) =>
            run(() => {
                const form = new FormData();
                form.append('photo', file);
                return apiUpload(`/admin/photos/${id}`, form, 'PUT');
            }),
        [run],
    );

    const remove = useCallback((id: string) => run(() => apiSend('DELETE', `/admin/photos/${id}`)), [run]);

    return { photos, busy, error, upload, addLink, replace, remove };
}
