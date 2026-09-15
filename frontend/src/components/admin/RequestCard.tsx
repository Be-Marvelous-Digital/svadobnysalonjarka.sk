import { useState } from 'react';
import type { Reservation } from '@/api/types';
import { Chip } from '@/components/Chip';
import { TextInput } from '@/components/Field';
import { useAvailability } from '@/hooks/useAvailability';
import { formatLongDate, formatTimeRange } from '@/utils/date';
import styles from './Admin.module.less';
import { buildReplyMailto } from './RequestCard.helpers';
import { STATUS_LABELS } from './status';

interface RequestCardProps {
    reservation: Reservation;
    duration: number;
    onConfirm: () => void;
    onReject: () => void;
    onRemove: () => void;
    onProposeAlternative: (date: string, time: string) => void;
}

export const RequestCard = ({ reservation, duration, onConfirm, onReject, onRemove, onProposeAlternative }: RequestCardProps) => {
    const [altOpen, setAltOpen] = useState(false);
    const [altDate, setAltDate] = useState(reservation.date);
    const [altTime, setAltTime] = useState('');
    const { slots } = useAvailability(altOpen ? altDate : '');

    return (
        <div className={styles.request}>
            <div className={styles.request__row}>
                <div className={styles.request__person}>
                    <span className={styles.request__name}>{reservation.name}</span>
                    <span className={styles.request__contact}>
                        {reservation.phone ? (
                            <a href={`tel:${reservation.phone.replace(/\s+/g, '')}`} className={styles.request__link}>
                                {reservation.phone}
                            </a>
                        ) : null}
                        {reservation.phone && reservation.email ? ' · ' : null}
                        {reservation.email ? (
                            <a href={`mailto:${reservation.email}`} className={styles.request__link}>
                                {reservation.email}
                            </a>
                        ) : null}
                        {!reservation.phone && !reservation.email ? 'bez kontaktu' : null}
                    </span>
                </div>
                <span className={styles.request__meta}>{reservation.cat}</span>
                <span className={`${styles.request__meta} ${styles['request__meta--when']}`}>
                    {formatLongDate(reservation.date)} · {formatTimeRange(reservation.time, duration)}
                </span>
                <span className={`${styles.status} ${styles[`status--${reservation.status}`]}`}>
                    {STATUS_LABELS[reservation.status]}
                </span>
            </div>

            {reservation.altDate ? (
                <span className={styles.request__alt}>
                    Navrhnutý termín: {formatLongDate(reservation.altDate)} · {reservation.altTime}
                </span>
            ) : null}

            <div className={styles.request__actions}>
                <button type="button" className={`${styles.action} ${styles['action--primary']}`} onClick={onConfirm}>
                    Potvrdiť
                </button>
                {reservation.email ? (
                    <a
                        href={buildReplyMailto(reservation, duration)}
                        className={`${styles.action} ${styles['action--gold']}`}
                        title={`Napísať na ${reservation.email}`}
                    >
                        Odpovedať e-mailom
                    </a>
                ) : null}
                <button
                    type="button"
                    className={`${styles.action} ${styles['action--outline']}`}
                    onClick={() => setAltOpen((open) => !open)}
                >
                    Navrhnúť iný termín
                </button>
                <button type="button" className={`${styles.action} ${styles['action--danger']}`} onClick={onReject}>
                    Zamietnuť
                </button>
                <button type="button" className={`${styles.action} ${styles['action--quiet']}`} onClick={onRemove}>
                    Zmazať
                </button>
            </div>

            {altOpen ? (
                <div className={styles.request__panel}>
                    <span className={styles.card__label}>Ponúknuť náhradný termín</span>
                    <TextInput
                        compact
                        type="date"
                        value={altDate}
                        onChange={(event) => {
                            setAltDate(event.target.value);
                            setAltTime('');
                        }}
                    />
                    <div className={styles.card__chips}>
                        {slots.map((slot) => (
                            <Chip key={slot} size="compact" selected={altTime === slot} onClick={() => setAltTime(slot)}>
                                {slot}
                            </Chip>
                        ))}
                    </div>
                    <div className={styles.request__actions}>
                        <button
                            type="button"
                            className={`${styles.action} ${styles['action--gold']}`}
                            onClick={() => {
                                if (!altDate || !altTime) return;
                                onProposeAlternative(altDate, altTime);
                                setAltOpen(false);
                            }}
                        >
                            Uložiť návrh
                        </button>
                        <button
                            type="button"
                            className={`${styles.action} ${styles['action--quiet']}`}
                            onClick={() => setAltOpen(false)}
                        >
                            Zrušiť
                        </button>
                    </div>
                    <span className={styles.request__alt}>
                        Návrh si zapíšeme k žiadosti. Klientke ho oznámte telefonicky, po jej súhlase termín potvrďte.
                    </span>
                </div>
            ) : null}
        </div>
    );
};
