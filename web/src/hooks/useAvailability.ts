import { useEffect, useState } from 'react';
import { apiGet } from '@/api/client';
import type { Availability } from '@/api/types';

interface AvailabilityState {
    slots: string[];
    duration: number;
    loading: boolean;
}

/** Asks the server which slots are still free; the client never derives availability itself. */
export function useAvailability(date: string): AvailabilityState {
    const [state, setState] = useState<AvailabilityState>({ slots: [], duration: 60, loading: false });

    useEffect(() => {
        if (!date) {
            setState({ slots: [], duration: 60, loading: false });
            return;
        }

        let active = true;
        setState((current) => ({ ...current, loading: true }));

        apiGet<Availability>(`/availability?date=${encodeURIComponent(date)}`)
            .then((data) => {
                if (active) setState({ slots: data.slots, duration: data.duration, loading: false });
            })
            .catch(() => {
                if (active) setState({ slots: [], duration: 60, loading: false });
            });

        return () => {
            active = false;
        };
    }, [date]);

    return state;
}
