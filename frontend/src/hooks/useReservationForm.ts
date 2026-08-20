import { useCallback, useMemo, useState } from 'react';
import { ApiError, apiSend } from '@/api/client';
import { BOOKABLE_COLLECTIONS } from '@/data/collections';

export interface ReservationDraft {
    cat: string;
    date: string;
    time: string;
    name: string;
    phone: string;
    email: string;
}

const EMPTY_DRAFT: ReservationDraft = {
    cat: BOOKABLE_COLLECTIONS[0]?.label ?? '',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
};

export function useReservationForm() {
    const [draft, setDraft] = useState<ReservationDraft>(EMPTY_DRAFT);
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);
    const [confirmed, setConfirmed] = useState<ReservationDraft | null>(null);

    const patch = useCallback((changes: Partial<ReservationDraft>) => {
        setDraft((current) => ({ ...current, ...changes }));
        setError('');
    }, []);

    const stepValid = useMemo(() => {
        if (step === 1) return Boolean(draft.cat && draft.date && draft.time);
        if (step === 2) return draft.name.trim().length > 1 && draft.phone.trim().length > 5 && draft.email.includes('@');
        return true;
    }, [step, draft]);

    const next = useCallback(() => {
        if (stepValid) setStep((current) => Math.min(3, current + 1));
    }, [stepValid]);

    const back = useCallback(() => setStep((current) => Math.max(1, current - 1)), []);

    const reset = useCallback(() => {
        setDraft(EMPTY_DRAFT);
        setStep(1);
        setDone(false);
        setError('');
        setConfirmed(null);
    }, []);

    const submit = useCallback(async () => {
        setSubmitting(true);
        setError('');
        try {
            await apiSend('POST', '/reservations', draft);
            setConfirmed(draft);
            setDone(true);
            window.scrollTo(0, 0);
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : 'Žiadosť sa nepodarilo odoslať. Skúste to, prosím, znova.');
            if (caught instanceof ApiError && caught.status === 409) setStep(1);
        } finally {
            setSubmitting(false);
        }
    }, [draft]);

    return { draft, patch, step, stepValid, next, back, submit, submitting, error, done, confirmed, reset };
}
