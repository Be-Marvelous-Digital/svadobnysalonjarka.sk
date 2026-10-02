import { useEffect, useState } from 'react';
import { apiGet } from '@/api/client';
import type { Week, WeekSlot } from '@/api/types';

/**
 * One day of the diary, with whoever is already booked into each slot.
 *
 * The public availability endpoint deliberately hides none of this: a client
 * asking about a busy time is fine, the salon sorts it out. The owner confirming
 * a time needs the opposite, and must see what is taken before agreeing to it.
 */
export function useAdminDay(date: string): { slots: WeekSlot[]; loading: boolean } {
    const [slots, setSlots] = useState<WeekSlot[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!date) {
            setSlots([]);
            return;
        }

        let active = true;
        setLoading(true);
        // The week endpoint starts at whatever date it is given, so the first day
        // it returns is the one wanted here.
        apiGet<Week>(`/admin/week?from=${date}`)
            .then((week) => {
                if (active) setSlots(week.days[0]?.slots ?? []);
            })
            .catch(() => {
                if (active) setSlots([]);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [date]);

    return { slots, loading };
}
