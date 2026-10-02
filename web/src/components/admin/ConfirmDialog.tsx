import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react';
import type { Reservation } from '@/api/types';
import { Field, TextInput } from '@/components/Field';
import { useAdminDay } from '@/hooks/useAdminDay';
import { useDialog } from '@/hooks/useDialog';
import { formatLongDate } from '@/utils/date';
import { SlotPicker } from './SlotPicker';
import styles from './Admin.module.scss';

interface ConfirmDialogProps {
    inquiry: Reservation;
    onConfirm: (id: string, date: string, time: string) => void;
    onClose: () => void;
}

export const ConfirmDialog = ({ inquiry, onConfirm, onClose }: ConfirmDialogProps) => {
    const ref = useDialog<HTMLDivElement>(onClose);

    // Pre-filled with what the client asked for, because most of the time that is
    // what gets agreed; the owner only edits it when the phone call says otherwise.
    const [date, setDate] = useState(inquiry.confirmedDate || inquiry.date);
    const [time, setTime] = useState(inquiry.confirmedTime || inquiry.time);
    const { slots } = useAdminDay(date);

    const name = [inquiry.firstName, inquiry.lastName].filter(Boolean).join(' ');
    const changed = date !== inquiry.date || time !== inquiry.time;

    const changeDate = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setDate(event.target.value);
        setTime('');
    }, []);

    const submit = useCallback(
        (event: FormEvent) => {
            event.preventDefault();
            if (date && time) onConfirm(inquiry.id, date, time);
        },
        [date, time, inquiry.id, onConfirm],
    );

    return (
        <div className={styles.overlay}>
            <div ref={ref} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                <form onSubmit={submit}>
                    <span className={styles.card__label}>Potvrdenie termínu</span>
                    <h2 id="confirm-title" className={styles.dialog__title}>
                        {name}
                    </h2>
                    <p className={styles.dialog__note}>
                        Požadovala {formatLongDate(inquiry.date)} o {inquiry.time}
                        {inquiry.cat ? ` · ${inquiry.cat}` : ''}. Potvrďte ten istý čas alebo zmeňte na ten, na ktorom ste sa
                        dohodli.
                    </p>

                    <Field label="Dátum">
                        <TextInput compact type="date" value={date} onChange={changeDate} />
                    </Field>

                    <SlotPicker slots={slots} value={time} onChange={setTime} ownId={inquiry.id} />

                    {changed && time ? (
                        <p className={styles.dialog__note}>
                            Potvrdíte {formatLongDate(date)} o {time}, teda iný termín, než klientka žiadala. Dajte jej o tom,
                            prosím, vedieť.
                        </p>
                    ) : null}

                    <div className={styles.dialog__actions}>
                        <button
                            type="submit"
                            className={`${styles.action} ${styles['action--primary']}`}
                            disabled={!date || !time}
                        >
                            Potvrdiť termín
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
