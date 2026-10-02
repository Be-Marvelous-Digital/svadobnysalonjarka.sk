import { useCallback } from 'react';
import type { Reservation } from '@/api/types';
import { useConfirm } from '@/hooks/useConfirm';
import { formatLongDate } from '@/utils/date';
import { ConfirmModal } from './ConfirmModal';
import styles from './Admin.module.scss';
import { buildReplyMailto } from './RequestCard.helpers';

interface InquiryCardProps {
    inquiry: Reservation;
    onConfirm: (inquiry: Reservation) => void;
    onToggleHandled: (id: string, handled: boolean) => void;
    onRemove: (id: string) => void;
}

export const InquiryCard = ({ inquiry, onConfirm, onToggleHandled, onRemove }: InquiryCardProps) => {
    const fullName = [inquiry.firstName, inquiry.lastName].filter(Boolean).join(' ').trim() || 'Bez mena';
    const ask = useConfirm();
    const startConfirm = useCallback(() => onConfirm(inquiry), [inquiry, onConfirm]);
    const toggle = useCallback(
        () => onToggleHandled(inquiry.id, !inquiry.handled),
        [inquiry.handled, inquiry.id, onToggleHandled],
    );

    const handleRemove = useCallback(
        () =>
            ask.ask({
                title: 'Zmazať dopyt?',
                body: `Dopyt od ${fullName} sa odstráni natrvalo. Nedá sa vrátiť späť.`,
                confirmLabel: 'Zmazať dopyt',
                onConfirm: () => onRemove(inquiry.id),
            }),
        [ask, fullName, inquiry.id, onRemove],
    );

    const className = [styles.request, inquiry.handled && styles['request--handled']].filter(Boolean).join(' ');

    return (
        <div className={className}>
            <div className={styles.request__row}>
                <div className={styles.request__person}>
                    <span className={styles.request__name}>{fullName}</span>
                    <span className={styles.request__contact}>
                        {inquiry.phone ? (
                            <a href={`tel:${inquiry.phone.replace(/\s+/g, '')}`} className={styles.request__link}>
                                {inquiry.phone}
                            </a>
                        ) : null}
                        {inquiry.phone && inquiry.email ? ' · ' : null}
                        {inquiry.email ? (
                            <a
                                href={`mailto:${inquiry.email}`}
                                className={styles.request__link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {inquiry.email}
                            </a>
                        ) : null}
                    </span>
                </div>

                <span className={styles.request__meta}>{inquiry.cat}</span>
                <span className={`${styles.request__meta} ${styles['request__meta--when']}`}>
                    {inquiry.confirmedDate ? (
                        <>
                            Potvrdené {formatLongDate(inquiry.confirmedDate)} · {inquiry.confirmedTime}
                        </>
                    ) : (
                        <>
                            {formatLongDate(inquiry.date)} · {inquiry.time}
                        </>
                    )}
                </span>
            </div>

            <div className={styles.request__actions}>
                <button type="button" className={`${styles.action} ${styles['action--primary']}`} onClick={startConfirm}>
                    {inquiry.confirmedDate ? 'Zmeniť termín' : 'Potvrdiť'}
                </button>
                {inquiry.email ? (
                    <a
                        href={buildReplyMailto(inquiry)}
                        className={`${styles.action} ${styles['action--gold']}`}
                        title={`Napísať na ${inquiry.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Odpovedať e-mailom
                    </a>
                ) : null}
                <button type="button" className={`${styles.action} ${styles['action--outline']}`} onClick={toggle}>
                    {inquiry.handled ? 'Vrátiť medzi nové' : 'Vybavené'}
                </button>
                <button type="button" className={`${styles.action} ${styles['action--quiet']}`} onClick={handleRemove}>
                    Zmazať
                </button>
            </div>
            {ask.pending ? <ConfirmModal request={ask.pending} onCancel={ask.cancel} onAccept={ask.accept} /> : null}
        </div>
    );
};
