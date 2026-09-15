import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '@/api/client';
import type { Week } from '@/api/types';
import { addDays, toDateKey } from '@/utils/date';

/** Monday of the week the given date falls in. */
export function mondayOf(date: Date): string {
    const day = date.getDay();
    // getDay() calls Sunday 0, and the salon's week starts on Monday.
    return toDateKey(addDays(date, day === 0 ? -6 : 1 - day));
}

export function useAdminWeek(refreshToken: number) {
    const [from, setFrom] = useState(() => mondayOf(new Date()));
    const [week, setWeek] = useState<Week | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        apiGet<Week>(`/admin/week?from=${from}`)
            .then((data) => {
                if (active) setWeek(data);
            })
            .catch(() => undefined)
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

    const toThisWeek = useCallback(() => setFrom(mondayOf(new Date())), []);

    return { from, week, loading, shift, toThisWeek };
}
