import { useCallback } from 'react';
import { useAdminWeek, mondayOf } from '@/hooks/useAdminWeek';
import { dayNumber, formatLongDate, weekdayShort } from '@/utils/date';
import styles from './Admin.module.less';

interface WeekCalendarProps {
    /** Bumped by the parent whenever an inquiry is confirmed, to refetch. */
    refreshToken: number;
}

export const WeekCalendar = ({ refreshToken }: WeekCalendarProps) => {
    const { from, week, loading, shift, toThisWeek } = useAdminWeek(refreshToken);

    const previous = useCallback(() => shift(-1), [shift]);
    const next = useCallback(() => shift(1), [shift]);

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
                    {!isThisWeek ? (
                        <button type="button" className={`${styles.action} ${styles['action--outline']}`} onClick={toThisWeek}>
                            Tento týždeň
                        </button>
                    ) : null}
                </div>
            </div>

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
                                day.slots.map((slot) => (
                                    <div
                                        key={slot.time}
                                        className={[styles.week__slot, slot.booked && styles['week__slot--booked']]
                                            .filter(Boolean)
                                            .join(' ')}
                                    >
                                        <span className={styles.week__time}>{slot.time}</span>
                                        {slot.booked ? (
                                            <span className={styles.week__who}>
                                                <span className={styles.week__name}>
                                                    {slot.booked.firstName} {slot.booked.lastName}
                                                </span>
                                                {slot.booked.cat ? (
                                                    <span className={styles.week__cat}>{slot.booked.cat}</span>
                                                ) : null}
                                            </span>
                                        ) : (
                                            <span className={styles.week__free}>voľné</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
