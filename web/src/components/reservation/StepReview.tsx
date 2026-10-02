import { Fragment } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { MailIcon } from '@/components/Icon';
import type { ReservationDraft } from '@/hooks/useReservationForm';
import { formatLongDate } from '@/utils/date';
import { ROUTES } from '@/utils/routes';
import styles from './ReservationForm.module.scss';

interface StepReviewProps {
    draft: ReservationDraft;
    submitting: boolean;
    onBack: () => void;
}

export const StepReview = ({ draft, submitting, onBack }: StepReviewProps) => {
    const rows = [
        { label: 'Typ šiat', value: draft.cat, plain: false },
        { label: 'Dátum a čas', value: `${formatLongDate(draft.date)} · ${draft.time}`, plain: false },
        { label: 'Meno', value: `${draft.firstName} ${draft.lastName}`, plain: false },
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

            <p className={styles.step__consent}>
                Odoslaním žiadosti súhlasíte so spracovaním uvedených osobných údajov na účel dohodnutia termínu skúšky a s ich
                odoslaním do nášho e-mailového nástroja. Podrobnosti aj vaše práva nájdete v{' '}
                <Link href={ROUTES.privacy}>zásadách ochrany súkromia</Link>.
            </p>

            <div className={styles.step__actions}>
                <button type="button" className={styles.step__back} onClick={onBack}>
                    ← Späť
                </button>
                <Button type="submit" variant="dark" disabled={submitting}>
                    <MailIcon /> {submitting ? 'Odosielam…' : 'Odoslať dopyt'}
                </Button>
            </div>
        </div>
    );
};
