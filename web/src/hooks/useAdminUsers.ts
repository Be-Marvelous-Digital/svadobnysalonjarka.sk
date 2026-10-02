import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiGet, apiSend } from '@/api/client';
import type { AdminUser } from '@/api/types';

export function useAdminUsers() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const refresh = useCallback(async () => {
        setUsers(await apiGet<AdminUser[]>('/admin/users'));
    }, []);

    useEffect(() => {
        refresh().catch(() => undefined);
    }, [refresh]);

    const run = useCallback(
        async (action: () => Promise<unknown>, success: string) => {
            setBusy(true);
            setError('');
            setNotice('');
            try {
                await action();
                setNotice(success);
                await refresh();
                return true;
            } catch (caught) {
                setError(caught instanceof ApiError ? caught.message : 'Operácia zlyhala.');
                return false;
            } finally {
                setBusy(false);
            }
        },
        [refresh],
    );

    const create = useCallback(
        (username: string, password: string) =>
            run(() => apiSend('POST', '/admin/users', { username, password }), `Používateľ „${username}“ bol vytvorený.`),
        [run],
    );

    const changeOwnPassword = useCallback(
        (currentPassword: string, newPassword: string) =>
            run(() => apiSend('PATCH', '/admin/users/me/password', { currentPassword, newPassword }), 'Vaše heslo bolo zmenené.'),
        [run],
    );

    const resetPassword = useCallback(
        (id: string, password: string, username: string) =>
            run(() => apiSend('PATCH', `/admin/users/${id}/password`, { password }), `Heslo pre „${username}“ bolo nastavené.`),
        [run],
    );

    const remove = useCallback(
        (id: string, username: string) =>
            run(() => apiSend('DELETE', `/admin/users/${id}`), `Používateľ „${username}“ bol zmazaný.`),
        [run],
    );

    return { users, busy, error, notice, create, changeOwnPassword, resetPassword, remove };
}
