import { Fragment } from 'react';
import { Button } from '@/components/Button';
import { MailIcon } from '@/components/Icon';
import type { ReservationDraft } from '@/hooks/useReservationForm';
import { formatLongDate } from '@/utils/date';
import styles from './ReservationForm.module.less';

interface StepReviewProps {
    draft: ReservationDraft;
    submitting: boolean;
    error: string;
    onBack: () => void;
    onSubmit: () => void;
}

export const StepReview = ({ draft, submitting, error, onBack, onSubmit }: StepReviewProps) => {
    const rows = [
        { label: 'Typ šiat', value: draft.cat, plain: false },
        { label: 'Dátum a čas', value: `${formatLongDate(draft.date)} · ${draft.time}`, plain: false },
        { label: 'Meno', value: draft.name, plain: false },
        { label: 'Kontakt', value: `${draft.phone} · ${draft.email}`, plain: true },
    ];

    return (
        <div className={styles.step}>
            <div className={styles.step__recap}>
                {rows.map((row) => (
                    <Fragment key={row.label}>
                        <div className={styles.step__recapLabel}>{row.label}</div>
                        <div
                            className={[styles.step__recapValue, row.plain && styles['step__recapValue--plain']]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {row.value}
                        </div>
                    </Fragment>
                ))}
            </div>

            <div className={styles.step__callout}>
                <span className={styles.step__label}>Dôležité</span>
                <p className={styles.step__note}>
                    Odoslaním žiadate o termín. Majiteľka vás do 24 hodín zavolá a termín potvrdí, alebo vám ponúkne iné voľné
                    dátumy a časy.
                </p>
            </div>

            {error ? <span className={styles.step__error}>{error}</span> : null}

            <div className={styles.step__actions}>
                <button type="button" className={styles.step__back} onClick={onBack}>
                    ← Späť
                </button>
                <Button variant="dark" onClick={onSubmit} disabled={submitting}>
                    <MailIcon /> {submitting ? 'Odosielam…' : 'Odoslať žiadosť'}
                </Button>
            </div>
        </div>
    );
};
