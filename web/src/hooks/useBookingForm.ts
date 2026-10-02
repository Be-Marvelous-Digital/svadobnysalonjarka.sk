import { useCallback, useMemo, useState } from 'react';
import type { BookingDraft } from '@/api/types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useBookingForm(date: string, time: string) {
    const [draft, setDraft] = useState<BookingDraft>({ firstName: '', lastName: '', phone: '', email: '', cat: '', date, time });

    const patch = useCallback((change: Partial<BookingDraft>) => setDraft((current) => ({ ...current, ...change })), []);

    const changeDate = useCallback((next: string) => setDraft((current) => ({ ...current, date: next, time: '' })), []);

    const valid = useMemo(
        () =>
            draft.firstName.trim().length > 0 &&
            draft.phone.replace(/\D/g, '').length >= 6 &&
            (draft.email === '' || EMAIL_PATTERN.test(draft.email.trim())) &&
            Boolean(draft.date && draft.time),
        [draft],
    );

    return { draft, patch, changeDate, valid };
}
