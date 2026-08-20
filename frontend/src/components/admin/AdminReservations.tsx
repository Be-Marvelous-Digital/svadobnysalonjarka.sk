import { useMemo, useState } from 'react';
import { Chip } from '@/components/Chip';
import { useAdminData } from '@/hooks/useAdminData';
import { formatLongDate, formatTimeRange, todayKey } from '@/utils/date';
import styles from './Admin.module.less';
import { DaySchedule } from './DaySchedule';
import { OwnerReservationForm } from './OwnerReservationForm';
import { RequestCard } from './RequestCard';
import { STATUS_LABELS } from './status';

const DURATION_OPTIONS = [30, 45, 60, 90, 120];
const BUFFER_OPTIONS = [0, 15, 30];

export const AdminReservations = () => {
    const [day, setDay] = useState(todayKey());
    const data = useAdminData(day);

    const pending = useMemo(
        () => data.reservations.filter((reservation) => reservation.status === 'pending'),
        [data.reservations],
    );

    const upcoming = useMemo(() => {
        const today = todayKey();
        return data.reservations.filter(
            (reservation) =>
                (reservation.status === 'confirmed' || reservation.status === 'blocked') && reservation.date >= today,
        );
    }, [data.reservations]);

    return (
        <div className={styles.panel}>
            {data.error ? <span className={styles.block__count}>{data.error}</span> : null}

            <div className={styles.card}>
                <div className={styles.card__group}>
                    <span className={styles.card__title}>Nastavenie skúšok</span>
                    <span className={styles.card__note}>
                        Z otváracích hodín a dĺžky skúšky vychádza {data.schedule?.slots.length ?? 0} možných termínov na vybraný
                        deň. Klientky vidia vo formulári len tie, ktoré sú ešte voľné.
                    </span>
                </div>
                <div className={styles.card__side}>
                    <div className={styles.card__group}>
                        <span className={styles.card__label}>Dĺžka jednej skúšky</span>
                        <div className={styles.card__chips}>
                            {DURATION_OPTIONS.map((minutes) => (
                                <Chip
                                    key={minutes}
                                    size="compact"
                                    selected={data.settings.duration === minutes}
                                    onClick={() => data.saveSettings({ ...data.settings, duration: minutes })}
                                >
                                    {minutes} min
                                </Chip>
                            ))}
                        </div>
                    </div>
                    <div className={styles.card__group}>
                        <span className={styles.card__label}>Pauza medzi skúškami</span>
                        <div className={styles.card__chips}>
                            {BUFFER_OPTIONS.map((minutes) => (
                                <Chip
                                    key={minutes}
                                    size="compact"
                                    selected={data.settings.buffer === minutes}
                                    onClick={() => data.saveSettings({ ...data.settings, buffer: minutes })}
                                >
                                    {minutes === 0 ? 'bez pauzy' : `${minutes} min`}
                                </Chip>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.block}>
                <div className={styles.block__head}>
                    <span className={styles.block__title}>Nové žiadosti</span>
                    <span className={styles.block__count}>{pending.length ? `${pending.length} čaká` : 'žiadne nové'}</span>
                </div>
                {pending.length === 0 ? (
                    <span className={styles.block__empty}>
                        Žiadne nové žiadosti. Objavia sa tu, keď klientka odošle formulár.
                    </span>
                ) : (
                    pending.map((reservation) => (
                        <RequestCard
                            key={reservation.id}
                            reservation={reservation}
                            duration={data.settings.duration}
                            onConfirm={() =>
                                data.patchReservation(reservation.id, { status: 'confirmed', altDate: '', altTime: '' })
                            }
                            onReject={() => data.patchReservation(reservation.id, { status: 'rejected' })}
                            onRemove={() => data.removeReservation(reservation.id)}
                            onProposeAlternative={(altDate, altTime) =>
                                data.patchReservation(reservation.id, { altDate, altTime })
                            }
                        />
                    ))
                )}
            </div>

            <DaySchedule
                day={day}
                duration={data.schedule?.duration ?? data.settings.duration}
                slots={data.schedule?.slots ?? []}
                reservations={data.reservations}
                onSelectDay={setDay}
                onBlock={data.createReservation}
                onRelease={data.removeReservation}
            />

            <OwnerReservationForm defaultDate={day} onCreate={data.createReservation} />

            <div className={`${styles.block} ${styles['block--separated']}`}>
                <span className={styles.block__title}>Potvrdené a blokované</span>
                {upcoming.length === 0 ? (
                    <span className={styles.block__empty}>
                        Zatiaľ nič potvrdené. Potvrdené skúšky a blokované časy sa zobrazia tu.
                    </span>
                ) : (
                    upcoming.map((reservation) => (
                        <div key={reservation.id} className={styles.upcoming}>
                            <div className={styles.request__person}>
                                <span className={styles.request__name}>{reservation.name}</span>
                                <span className={styles.request__contact}>
                                    {[reservation.phone, reservation.email].filter(Boolean).join(' · ') || 'bez kontaktu'}
                                </span>
                            </div>
                            <span className={`${styles.request__meta} ${styles['request__meta--when']}`}>
                                {formatLongDate(reservation.date)} · {formatTimeRange(reservation.time, data.settings.duration)}
                            </span>
                            <span className={`${styles.status} ${styles[`status--${reservation.status}`]}`}>
                                {STATUS_LABELS[reservation.status]}
                            </span>
                            <button
                                type="button"
                                className={`${styles.action} ${styles['action--link']} ${styles.upcoming__remove}`}
                                onClick={() => data.removeReservation(reservation.id)}
                            >
                                Zmazať
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
