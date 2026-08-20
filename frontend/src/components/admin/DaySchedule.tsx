import { useState } from 'react';
import type { Reservation } from '@/api/types';
import { TextInput } from '@/components/Field';
import type { OwnerReservationInput } from '@/hooks/useAdminData';
import { addDays, dayNumber, formatLongDate, formatTimeRange, toDateKey, weekdayShort } from '@/utils/date';
import styles from './Admin.module.less';
import { STATUS_LABELS } from './status';

interface DaySlot {
    time: string;
    reservation: null | { id: string; name: string; note: string; status: Reservation['status']; kind: string };
}

interface DayScheduleProps {
    day: string;
    duration: number;
    slots: DaySlot[];
    reservations: Reservation[];
    onSelectDay: (day: string) => void;
    onBlock: (input: OwnerReservationInput) => void;
    onRelease: (id: string) => void;
}

const EMPTY_BLOCK = { name: '', phone: '', email: '', note: '' };

export const DaySchedule = ({ day, duration, slots, reservations, onSelectDay, onBlock, onRelease }: DayScheduleProps) => {
    const [blockTime, setBlockTime] = useState('');
    const [blockData, setBlockData] = useState(EMPTY_BLOCK);

    const strip = Array.from({ length: 14 }, (_, offset) => {
        const key = toDateKey(addDays(new Date(), offset));
        const count = reservations.filter((r) => r.date === key && r.status !== 'rejected').length;
        return { key, count };
    });

    return (
        <div className={`${styles.block} ${styles['block--separated']}`}>
            <div className={styles.block__head}>
                <span className={styles.block__title}>Denný rozpis</span>
                <span className={styles.block__count}>{formatLongDate(day)}</span>
            </div>

            <div className={styles.dayStrip}>
                {strip.map((entry) => (
                    <button
                        key={entry.key}
                        type="button"
                        className={[styles.dayStrip__day, entry.key === day && styles['dayStrip__day--active']]
                            .filter(Boolean)
                            .join(' ')}
                        onClick={() => onSelectDay(entry.key)}
                    >
                        <span className={styles.dayStrip__dow}>{weekdayShort(entry.key)}</span>
                        <span className={styles.dayStrip__num}>{dayNumber(entry.key)}</span>
                        <span className={styles.dayStrip__count}>{entry.count ? `${entry.count}x` : 'voľné'}</span>
                    </button>
                ))}
            </div>

            {slots.length === 0 ? (
                <span className={styles.block__empty}>V tento deň máme zatvorené, žiadne termíny sa negenerujú.</span>
            ) : (
                slots.map((slot) => {
                    const status = slot.reservation?.status;
                    return (
                        <div key={slot.time}>
                            <div className={[styles.slotRow, status && styles[`slotRow--${status}`]].filter(Boolean).join(' ')}>
                                <span className={styles.slotRow__range}>{formatTimeRange(slot.time, duration)}</span>
                                <span className={styles.slotRow__who}>
                                    {slot.reservation?.name ?? 'Voľný termín'}
                                    {slot.reservation?.note ? (
                                        <span className={styles.slotRow__note}>{slot.reservation.note}</span>
                                    ) : null}
                                </span>
                                <span className={`${styles.status} ${styles[status ? `status--${status}` : 'status--free']}`}>
                                    {status ? STATUS_LABELS[status] : 'Voľné'}
                                </span>
                                {slot.reservation ? (
                                    <button
                                        type="button"
                                        className={`${styles.action} ${styles['action--link']}`}
                                        onClick={() => onRelease(slot.reservation?.id ?? '')}
                                    >
                                        Uvoľniť
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className={`${styles.action} ${styles['action--link']}`}
                                        onClick={() => {
                                            setBlockTime(slot.time);
                                            setBlockData(EMPTY_BLOCK);
                                        }}
                                    >
                                        Blokovať
                                    </button>
                                )}
                            </div>

                            {blockTime === slot.time ? (
                                <div className={styles.blockForm}>
                                    <span className={styles.card__label}>
                                        Blokovať {formatTimeRange(slot.time, duration)} — údaje klientky
                                    </span>
                                    <div className={styles.blockForm__grid}>
                                        <TextInput
                                            compact
                                            type="text"
                                            value={blockData.name}
                                            placeholder="Meno klientky (nepovinné)"
                                            onChange={(event) => setBlockData({ ...blockData, name: event.target.value })}
                                        />
                                        <TextInput
                                            compact
                                            type="tel"
                                            value={blockData.phone}
                                            placeholder="Telefón"
                                            onChange={(event) => setBlockData({ ...blockData, phone: event.target.value })}
                                        />
                                        <TextInput
                                            compact
                                            type="email"
                                            value={blockData.email}
                                            placeholder="E-mail"
                                            onChange={(event) => setBlockData({ ...blockData, email: event.target.value })}
                                        />
                                    </div>
                                    <TextInput
                                        compact
                                        type="text"
                                        value={blockData.note}
                                        placeholder="Poznámka (napr. druhá skúška, osobné voľno)"
                                        onChange={(event) => setBlockData({ ...blockData, note: event.target.value })}
                                    />
                                    <div className={styles.blockForm__actions}>
                                        <button
                                            type="button"
                                            className={`${styles.action} ${styles['action--primary']}`}
                                            onClick={() => {
                                                onBlock({
                                                    ...blockData,
                                                    name: blockData.name.trim() || 'Blokovaný čas',
                                                    date: day,
                                                    time: slot.time,
                                                    kind: 'blok',
                                                });
                                                setBlockTime('');
                                            }}
                                        >
                                            Blokovať termín
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.action} ${styles['action--quiet']}`}
                                            onClick={() => setBlockTime('')}
                                        >
                                            Zrušiť
                                        </button>
                                        <span className={styles.blockForm__hint}>
                                            Bez mena sa termín zablokuje ako osobné voľno.
                                        </span>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    );
                })
            )}
        </div>
    );
};
