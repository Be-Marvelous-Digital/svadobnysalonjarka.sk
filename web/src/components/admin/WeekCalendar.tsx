import { useCallback } from 'react';
import type { Reservation } from '@/api/types';
import { TextInput } from '@/components/Field';
import { BookedSlot } from './BookedSlot';
import { useAdminWeek, mondayOf } from '@/hooks/useAdminWeek';
import { dayNumber, formatLongDate, weekdayShort } from '@/utils/date';
import styles from './Admin.module.scss';

interface WeekCalendarProps {
    /** Bumped by the parent whenever an inquiry is confirmed, to refetch. */
    refreshToken: number;
    onReschedule: (inquiry: Reservation) => void;
}

export const WeekCalendar = ({ refreshToken, onReschedule }: WeekCalendarProps) => {
    const { from, week, loading, error, shift, goToWeekOf, toThisWeek } = useAdminWeek(refreshToken);

    const previous = useCallback(() => shift(-1), [shift]);
    const next = useCallback(() => shift(1), [shift]);
    const pick = useCallback((event: React.ChangeEvent<HTMLInputElement>) => goToWeekOf(event.target.value), [goToWeekOf]);

    const days = week?.days ?? [];
    const last = days[days.length - 1];
    const isThisWeek = from === mondayOf(new Date());
    const today = new Date().toISOString().slice(0, 10);

    return (
        <div className={styles.week}>
            <div className={styles.block__head}>
                <span className={styles.block__title}>Kalendár</span>
                <div className={styles.week__nav}>
                    <button
                        type="button"
                        className={`${styles.action} ${styles['action--step']}`}
                        onClick={previous}
                        aria-label="Predchádzajúci týždeň"
                    >
                        ←
                    </button>
                    <span className={styles.week__range}>
                        {days[0] ? formatLongDate(days[0].date) : ''} – {last ? formatLongDate(last.date) : ''}
                    </span>
                    <button
                        type="button"
                        className={`${styles.action} ${styles['action--step']}`}
                        onClick={next}
                        aria-label="Nasledujúci týždeň"
                    >
                        →
                    </button>
                    {/* Always present, so the toolbar does not reflow as the week
                        changes; disabled tells the owner where they already are. */}
                    <button
                        type="button"
                        className={`${styles.action} ${styles['action--outline']}`}
                        onClick={toThisWeek}
                        disabled={isThisWeek}
                    >
                        Tento týždeň
                    </button>
                    {/* Jumping months ahead should not take a dozen clicks. */}
                    <label className={styles.week__jump}>
                        <span className={styles.week__jumpLabel}>Skočiť na</span>
                        <TextInput compact type="date" value={from} onChange={pick} aria-label="Zobraziť týždeň s dátumom" />
                    </label>
                </div>
            </div>

            {error ? (
                <span className={styles.block__count} role="alert">
                    {error}
                </span>
            ) : null}

            {loading && !week ? (
                <span className={styles.block__empty}>Načítavam…</span>
            ) : (
                <div className={styles.week__grid}>
                    {days.map((day) => (
                        <div
                            key={day.date}
                            className={[styles.week__day, day.date === today && styles['week__day--today']]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            <div className={styles.week__dayHead}>
                                <span className={styles.week__dow}>{weekdayShort(day.date)}</span>
                                <span className={styles.week__num}>{dayNumber(day.date)}</span>
                            </div>

                            {day.slots.length === 0 ? (
                                <span className={styles.week__closed}>zatvorené</span>
                            ) : (
                                day.slots.map((slot) =>
                                    slot.booked ? (
                                        <BookedSlot
                                            key={slot.time}
                                            date={day.date}
                                            time={slot.time}
                                            booked={slot.booked}
                                            onReschedule={onReschedule}
                                        />
                                    ) : (
                                        <div key={slot.time} className={styles.week__slot}>
                                            <span className={styles.week__time}>{slot.time}</span>
                                            <span className={styles.week__free}>voľné</span>
                                        </div>
                                    ),
                                )
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
