import { useCallback, useState, type FormEvent } from 'react';
import type { Reservation } from '@/api/types';
import { Field, TextInput } from '@/components/Field';
import { useAdminDay } from '@/hooks/useAdminDay';
import { useDialog } from '@/hooks/useDialog';
import { formatLongDate } from '@/utils/date';
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
                        <TextInput
                            compact
                            type="date"
                            value={date}
                            onChange={(event) => {
                                setDate(event.target.value);
                                setTime('');
                            }}
                        />
                    </Field>

                    <div className={styles.card__group}>
                        <span className={styles.card__label}>Čas</span>
                        <div className={styles.dialog__slots}>
                            {slots.map((slot) => {
                                // A slot held by this very inquiry stays choosable, so
                                // re-confirming an unchanged time is not blocked by itself.
                                const takenByAnother = Boolean(slot.booked && slot.booked.id !== inquiry.id);
                                const takenBy = slot.booked ? `${slot.booked.firstName} ${slot.booked.lastName}`.trim() : '';

                                return (
                                    <button
                                        key={slot.time}
                                        type="button"
                                        className={[
                                            styles.action,
                                            styles['action--outline'],
                                            slot.time === time && styles['action--gold'],
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                        disabled={takenByAnother}
                                        title={takenByAnother ? `Obsadené — ${takenBy}` : undefined}
                                        onClick={() => setTime(slot.time)}
                                    >
                                        {slot.time}
                                        {takenByAnother ? <span className={styles.dialog__taken}>{takenBy}</span> : null}
                                    </button>
                                );
                            })}
                            {slots.length === 0 ? <span className={styles.dialog__note}>V tento deň neskúšame.</span> : null}
                        </div>
                    </div>

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
