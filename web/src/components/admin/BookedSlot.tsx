import { useCallback, useId, useRef, useState } from 'react';
import type { BookedSlot as Booked, Reservation } from '@/api/types';
import { formatLongDate } from '@/utils/date';
import styles from './Admin.module.scss';

interface BookedSlotProps {
    date: string;
    time: string;
    booked: Booked;
    onReschedule: (inquiry: Reservation) => void;
}

/**
 * The calendar only carries what it needs to draw a slot, but the confirmation
 * dialog works on an inquiry. Everything it asks for is already here, so the
 * record is rebuilt rather than refetched.
 */
function asInquiry(date: string, time: string, booked: Booked): Reservation {
    return {
        id: booked.id,
        firstName: booked.firstName,
        lastName: booked.lastName,
        phone: booked.phone,
        email: booked.email,
        cat: booked.cat,
        date: booked.requestedDate,
        time: booked.requestedTime,
        handled: true,
        confirmedDate: date,
        confirmedTime: time,
        createdAt: '',
    };
}

/**
 * A booked slot that reveals the client's details.
 *
 * Hover alone would put the phone number and e-mail out of reach on a phone and
 * for anyone on a keyboard, so the slot is a button: pointer, focus and click all
 * open it. The card stays open while the pointer is inside it, otherwise the
 * links in it could never be clicked.
 */
export const BookedSlot = ({ date, time, booked, onReschedule }: BookedSlotProps) => {
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

    const reschedule = useCallback(() => {
        setOpen(false);
        onReschedule(asInquiry(date, time, booked));
    }, [booked, date, onReschedule, time]);

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

                    <button type="button" className={styles.popover__action} onClick={reschedule}>
                        Zmeniť termín skúšky
                    </button>
                </div>
            ) : null}
        </div>
    );
};
