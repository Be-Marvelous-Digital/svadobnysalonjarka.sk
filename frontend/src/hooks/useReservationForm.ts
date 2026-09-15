import { useCallback, useMemo, useState } from 'react';
import { ApiError, apiSend } from '@/api/client';
import { BOOKABLE_COLLECTIONS } from '@/data/collections';
import { validateAll, validateStep, type FieldErrors } from './reservationValidation';

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

    // Errors only appear once a step has been submitted, so the form does not
    // scold someone for fields they have not reached yet.
    const [showErrors, setShowErrors] = useState(false);

    const patch = useCallback((changes: Partial<ReservationDraft>) => {
        setDraft((current) => ({ ...current, ...changes }));
        setError('');
    }, []);

    const fieldErrors: FieldErrors = useMemo(() => validateStep(step, draft), [step, draft]);
    const stepValid = Object.keys(fieldErrors).length === 0;
    const visibleErrors: FieldErrors = showErrors ? fieldErrors : {};

    const next = useCallback(() => {
        if (!stepValid) {
            setShowErrors(true);
            return;
        }
        setShowErrors(false);
        setStep((current) => Math.min(3, current + 1));
    }, [stepValid]);

    const back = useCallback(() => {
        setShowErrors(false);
        setStep((current) => Math.max(1, current - 1));
    }, []);

    const reset = useCallback(() => {
        setDraft(EMPTY_DRAFT);
        setStep(1);
        setDone(false);
        setError('');
        setShowErrors(false);
        setConfirmed(null);
    }, []);

    const submit = useCallback(async () => {
        // Last line of defence before the request leaves: a visitor who reached
        // step three through a stale draft still cannot send an incomplete one.
        const remaining = validateAll(draft);
        if (Object.keys(remaining).length > 0) {
            setShowErrors(true);
            setStep(Object.keys(validateStep(1, draft)).length > 0 ? 1 : 2);
            return;
        }

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

    return {
        draft,
        patch,
        step,
        stepValid,
        fieldErrors: visibleErrors,
        next,
        back,
        submit,
        submitting,
        error,
        done,
        confirmed,
        reset,
    };
}
