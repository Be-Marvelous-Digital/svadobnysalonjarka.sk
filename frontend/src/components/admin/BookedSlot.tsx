import { useCallback, useId, useRef, useState } from 'react';
import type { BookedSlot as Booked } from '@/api/types';
import { formatLongDate } from '@/utils/date';
import styles from './Admin.module.less';

interface BookedSlotProps {
    date: string;
    time: string;
    booked: Booked;
}

/**
 * A booked slot that reveals the client's details.
 *
 * Hover alone would put the phone number and e-mail out of reach on a phone and
 * for anyone on a keyboard, so the slot is a button: pointer, focus and click all
 * open it. The card stays open while the pointer is inside it, otherwise the
 * links in it could never be clicked.
 */
export const BookedSlot = ({ date, time, booked }: BookedSlotProps) => {
    const [open, setOpen] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const detailsId = useId();

    const show = useCallback(() => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setOpen(true);
    }, []);

    // A short grace period covers the gap the pointer crosses on its way in.
    const hide = useCallback(() => {
        closeTimer.current = setTimeout(() => setOpen(false), 120);
    }, []);

    const toggle = useCallback(() => setOpen((current) => !current), []);

    const name = `${booked.firstName} ${booked.lastName}`.trim();
    // Only worth saying when the agreed slot is not the one she asked for.
    const moved = booked.requestedDate !== date || booked.requestedTime !== time;
    const movedFrom = moved && booked.requestedDate ? `${formatLongDate(booked.requestedDate)} · ${booked.requestedTime}` : '';

    return (
        <div className={styles.week__slotWrap} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
            <button
                type="button"
                className={`${styles.week__slot} ${styles['week__slot--booked']}`}
                onClick={toggle}
                aria-expanded={open}
                aria-controls={detailsId}
            >
                <span className={styles.week__time}>{time}</span>
                <span className={styles.week__who}>
                    <span className={styles.week__name}>{name}</span>
                    {booked.cat ? <span className={styles.week__cat}>{booked.cat}</span> : null}
                </span>
            </button>

            {open ? (
                <div id={detailsId} className={styles.popover}>
                    <span className={styles.popover__name}>{name}</span>
                    {booked.cat ? <span className={styles.popover__row}>{booked.cat}</span> : null}

                    {booked.phone ? (
                        <a className={styles.popover__link} href={`tel:${booked.phone.replace(/\s+/g, '')}`}>
                            {booked.phone}
                        </a>
                    ) : null}
                    {booked.email ? (
                        <a
                            className={styles.popover__link}
                            href={`mailto:${booked.email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {booked.email}
                        </a>
                    ) : null}

                    {movedFrom ? <span className={styles.popover__note}>Pôvodne žiadala {movedFrom}</span> : null}
                </div>
            ) : null}
        </div>
    );
};
