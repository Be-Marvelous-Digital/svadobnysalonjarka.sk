import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiGet, apiSend } from '@/api/client';

export function useAdminSession() {
    const [authed, setAuthed] = useState(false);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        apiGet('/admin/me')
            .then(() => {
                if (active) setAuthed(true);
            })
            .catch(() => undefined)
            .finally(() => {
                if (active) setChecking(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const login = useCallback(async (username: string, password: string) => {
        setError('');
        try {
            await apiSend('POST', '/admin/login', { username, password });
            setAuthed(true);
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : 'Prihlásenie zlyhalo.');
        }
    }, []);

    const logout = useCallback(async () => {
        await apiSend('POST', '/admin/logout').catch(() => undefined);
        setAuthed(false);
    }, []);

    return { authed, checking, error, login, logout };
}
