import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiGet, apiSend } from '@/api/client';
import type { Reservation } from '@/api/types';

/**
 * The admin only reads inquiries and marks them off. There is no approval step:
 * the owner rings the client and agrees the date on the phone.
 */
export function useAdminInquiries() {
    const [inquiries, setInquiries] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const refresh = useCallback(async () => {
        try {
            setInquiries(await apiGet<Reservation[]>('/admin/reservations'));
            setError('');
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : 'Dopyty sa nepodarilo načítať.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const run = useCallback(
        async (action: () => Promise<unknown>) => {
            try {
                await action();
                await refresh();
            } catch (caught) {
                setError(caught instanceof ApiError ? caught.message : 'Operácia zlyhala.');
            }
        },
        [refresh],
    );

    const setHandled = useCallback(
        (id: string, handled: boolean) =>
            // Clearing the flag also drops the agreed time, so the inquiry comes
            // back as something still to sort out rather than a ghost in the diary.
            run(() =>
                apiSend(
                    'PATCH',
                    `/admin/reservations/${id}`,
                    handled ? { handled } : { handled, confirmedDate: '', confirmedTime: '' },
                ),
            ),
        [run],
    );

    const confirm = useCallback(
        (id: string, confirmedDate: string, confirmedTime: string) =>
            run(() => apiSend('PATCH', `/admin/reservations/${id}`, { confirmedDate, confirmedTime })),
        [run],
    );

    const remove = useCallback((id: string) => run(() => apiSend('DELETE', `/admin/reservations/${id}`)), [run]);

    return { inquiries, loading, error, setHandled, confirm, remove };
}
