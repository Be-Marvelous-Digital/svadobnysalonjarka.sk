import { memo, useCallback } from 'react';
import { formatLongDate } from '@/utils/date';
import styles from './Admin.module.scss';

interface FreeSlotProps {
    date: string;
    time: string;
    past: boolean;
    onBook: (date: string, time: string) => void;
}

export const FreeSlot = memo(({ date, time, past, onBook }: FreeSlotProps) => {
    const book = useCallback(() => onBook(date, time), [date, onBook, time]);

    if (past) {
        return (
            <div className={styles.week__slot}>
                <span className={styles.week__time}>{time}</span>
                <span className={styles.week__free}>voľné</span>
            </div>
        );
    }

    return (
        <button
            type="button"
            className={`${styles.week__slot} ${styles['week__slot--free']}`}
            onClick={book}
            aria-label={`Zapísať termín ${formatLongDate(date)} o ${time}`}
        >
            <span className={styles.week__time}>{time}</span>
            <span className={styles.week__free}>voľné</span>
        </button>
    );
});
