import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react';
import type { BookingDraft } from '@/api/types';
import { Field, TextInput } from '@/components/Field';
import { useAdminDay } from '@/hooks/useAdminDay';
import { useBookingForm } from '@/hooks/useBookingForm';
import { useDialog } from '@/hooks/useDialog';
import { todayKey } from '@/utils/date';
import { CategoryPicker } from './CategoryPicker';
import { SlotPicker } from './SlotPicker';
import styles from './Admin.module.scss';

interface BookingDialogProps {
    initialDate: string;
    initialTime: string;
    /** Resolves to an error message, or an empty string once the booking is saved. */
    onBook: (draft: BookingDraft) => Promise<string>;
    onClose: () => void;
}

type TextField = 'firstName' | 'lastName' | 'phone' | 'email';

export const BookingDialog = ({ initialDate, initialTime, onBook, onClose }: BookingDialogProps) => {
    const ref = useDialog<HTMLDivElement>(onClose);
    const { draft, patch, changeDate, valid } = useBookingForm(initialDate, initialTime);
    const { slots } = useAdminDay(draft.date);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const changeField = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => patch({ [event.target.name as TextField]: event.target.value }),
        [patch],
    );
    const pickDate = useCallback((event: ChangeEvent<HTMLInputElement>) => changeDate(event.target.value), [changeDate]);
    const pickTime = useCallback((time: string) => patch({ time }), [patch]);
    const pickCategory = useCallback((cat: string) => patch({ cat }), [patch]);

    const submit = useCallback(
        async (event: FormEvent) => {
            event.preventDefault();
            if (!valid || submitting) return;
            setSubmitting(true);
            const message = await onBook(draft);
            setSubmitting(false);
            if (message) setError(message);
        },
        [draft, onBook, submitting, valid],
    );

    return (
        <div className={styles.overlay}>
            <div ref={ref} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="booking-title">
                <form onSubmit={submit} noValidate>
                    <span className={styles.card__label}>Telefonická rezervácia</span>
                    <h2 id="booking-title" className={styles.dialog__title}>
                        Zapísať termín skúšky
                    </h2>
                    <p className={styles.dialog__note}>
                        Termín sa uloží rovno ako potvrdený a objaví sa v kalendári. Stačí meno a telefón.
                    </p>

                    <div className={styles.dialog__fields}>
                        <Field label="Meno">
                            <TextInput compact name="firstName" value={draft.firstName} onChange={changeField} autoFocus />
                        </Field>
                        <Field label="Priezvisko">
                            <TextInput compact name="lastName" value={draft.lastName} onChange={changeField} />
                        </Field>
                        <Field label="Telefón">
                            <TextInput compact type="tel" name="phone" value={draft.phone} onChange={changeField} />
                        </Field>
                        <Field label="E-mail (nepovinné)">
                            <TextInput compact type="email" name="email" value={draft.email} onChange={changeField} />
                        </Field>
                    </div>

                    <CategoryPicker value={draft.cat} onChange={pickCategory} />

                    <Field label="Dátum">
                        <TextInput compact type="date" min={todayKey()} value={draft.date} onChange={pickDate} />
                    </Field>

                    <SlotPicker slots={slots} value={draft.time} onChange={pickTime} />

                    {error ? (
                        <p className={styles.dialog__error} role="alert">
                            {error}
                        </p>
                    ) : null}

                    <div className={styles.dialog__actions}>
                        <button
                            type="submit"
                            className={`${styles.action} ${styles['action--primary']}`}
                            disabled={!valid || submitting}
                        >
                            {submitting ? 'Ukladám…' : 'Zapísať termín'}
                        </button>
                        <button type="button" className={`${styles.action} ${styles['action--quiet']}`} onClick={onClose}>
                            Zrušiť
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
