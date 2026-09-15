import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiGet } from '@/api/client';
import type { Week } from '@/api/types';
import { addDays, toDateKey } from '@/utils/date';

/** Monday of the week the given date falls in. */
export function mondayOf(date: Date): string {
    const day = date.getDay();
    // getDay() calls Sunday 0, and the salon's week starts on Monday.
    return toDateKey(addDays(date, day === 0 ? -6 : 1 - day));
}

/** Monday of the week containing a YYYY-MM-DD date, ignoring anything malformed. */
export function mondayOfKey(key: string): string | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const parsed = new Date(`${key}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : mondayOf(parsed);
}

export function useAdminWeek(refreshToken: number) {
    const [from, setFrom] = useState(() => mondayOf(new Date()));
    const [week, setWeek] = useState<Week | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        setLoading(true);

        apiGet<Week>(`/admin/week?from=${from}`)
            .then((data) => {
                if (!active) return;
                setWeek(data);
                setError('');
            })
            .catch((caught) => {
                if (!active) return;
                // Swallowing this left the previous week on screen, which reads as
                // "the calendar will not go any further" rather than as a failure.
                setError(caught instanceof ApiError ? caught.message : 'Týždeň sa nepodarilo načítať.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [from, refreshToken]);

    const shift = useCallback((weeks: number) => {
        setFrom((current) => toDateKey(addDays(new Date(`${current}T12:00:00`), weeks * 7)));
    }, []);

    const goToWeekOf = useCallback((key: string) => {
        const monday = mondayOfKey(key);
        if (monday) setFrom(monday);
    }, []);

    const toThisWeek = useCallback(() => setFrom(mondayOf(new Date())), []);

    return { from, week, loading, error, shift, goToWeekOf, toThisWeek };
}
