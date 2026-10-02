import { useCallback, useMemo, useState } from 'react';
import type { BookingDraft, Reservation } from '@/api/types';
import { useAdminInquiries } from '@/hooks/useAdminInquiries';
import { BookingDialog } from './BookingDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { InquiryCard } from './InquiryCard';
import { WeekCalendar } from './WeekCalendar';
import styles from './Admin.module.scss';

export const AdminInquiries = () => {
    const { inquiries, loading, error, setHandled, confirm, book, remove } = useAdminInquiries();
    const [confirming, setConfirming] = useState<Reservation | null>(null);
    const [booking, setBooking] = useState<{ date: string; time: string } | null>(null);
    // Bumped on every confirmation so the calendar refetches the affected week.
    const [calendarToken, setCalendarToken] = useState(0);

    const handleToggle = useCallback(
        (id: string, handled: boolean) => {
            void setHandled(id, handled);
            setCalendarToken((token) => token + 1);
        },
        [setHandled],
    );
    const handleRemove = useCallback(
        (id: string) => {
            void remove(id);
            setCalendarToken((token) => token + 1);
        },
        [remove],
    );
    const openConfirm = useCallback((inquiry: Reservation) => setConfirming(inquiry), []);
    const closeConfirm = useCallback(() => setConfirming(null), []);
    const applyConfirm = useCallback(
        (id: string, date: string, time: string) => {
            void confirm(id, date, time);
            setCalendarToken((token) => token + 1);
            setConfirming(null);
        },
        [confirm],
    );

    const openBooking = useCallback((date: string, time: string) => setBooking({ date, time }), []);
    const closeBooking = useCallback(() => setBooking(null), []);
    const applyBooking = useCallback(
        async (draft: BookingDraft) => {
            const message = await book(draft);
            if (!message) {
                setCalendarToken((token) => token + 1);
                setBooking(null);
            }
            return message;
        },
        [book],
    );

    // Newest first: the one that just came in is the one the owner wants.
    const sorted = useMemo(
        () => [...inquiries].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
        [inquiries],
    );
    const fresh = useMemo(() => sorted.filter((inquiry) => !inquiry.handled), [sorted]);
    const handled = useMemo(() => sorted.filter((inquiry) => inquiry.handled), [sorted]);

    if (loading) return <div className={styles.panel} />;

    return (
        <div className={styles.panel}>
            <WeekCalendar refreshToken={calendarToken} onReschedule={openConfirm} onBook={openBooking} />

            {error ? (
                <span className={styles.block__count} role="alert">
                    {error}
                </span>
            ) : null}

            <div className={styles.block}>
                <div className={styles.block__head}>
                    <span className={styles.block__title}>Nové dopyty</span>
                    <span className={styles.block__count}>{fresh.length}</span>
                </div>
                <span className={styles.block__empty}>
                    Dohodnite sa s klientkou telefonicky alebo e-mailom a potom termín potvrďte — objaví sa v kalendári vyššie a
                    dopyt sa presunie medzi vybavené.
                </span>

                {fresh.length === 0 ? (
                    <span className={styles.block__empty}>Žiadne nové dopyty.</span>
                ) : (
                    fresh.map((inquiry) => (
                        <InquiryCard
                            key={inquiry.id}
                            inquiry={inquiry}
                            onConfirm={openConfirm}
                            onToggleHandled={handleToggle}
                            onRemove={handleRemove}
                        />
                    ))
                )}
            </div>

            {handled.length > 0 ? (
                <div className={`${styles.block} ${styles['block--separated']}`}>
                    <div className={styles.block__head}>
                        <span className={styles.block__title}>Vybavené</span>
                        <span className={styles.block__count}>{handled.length}</span>
                    </div>
                    {handled.map((inquiry) => (
                        <InquiryCard
                            key={inquiry.id}
                            inquiry={inquiry}
                            onConfirm={openConfirm}
                            onToggleHandled={handleToggle}
                            onRemove={handleRemove}
                        />
                    ))}
                </div>
            ) : null}

            {booking ? (
                <BookingDialog
                    initialDate={booking.date}
                    initialTime={booking.time}
                    onBook={applyBooking}
                    onClose={closeBooking}
                />
            ) : null}
            {confirming ? <ConfirmDialog inquiry={confirming} onConfirm={applyConfirm} onClose={closeConfirm} /> : null}
        </div>
    );
};
