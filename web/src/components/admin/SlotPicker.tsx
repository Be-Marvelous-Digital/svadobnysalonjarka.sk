import { memo, useCallback } from 'react';
import type { WeekSlot } from '@/api/types';
import styles from './Admin.module.scss';

interface SlotOptionProps {
    slot: WeekSlot;
    selected: boolean;
    takenBy: string;
    onPick: (time: string) => void;
}

const SlotOption = memo(({ slot, selected, takenBy, onPick }: SlotOptionProps) => {
    const pick = useCallback(() => onPick(slot.time), [onPick, slot.time]);

    return (
        <button
            type="button"
            className={[styles.action, styles['action--outline'], selected && styles['action--gold']].filter(Boolean).join(' ')}
            disabled={Boolean(takenBy)}
            title={takenBy ? `Obsadené — ${takenBy}` : undefined}
            onClick={pick}
        >
            {slot.time}
            {takenBy ? <span className={styles.dialog__taken}>{takenBy}</span> : null}
        </button>
    );
});

interface SlotPickerProps {
    slots: WeekSlot[];
    value: string;
    onChange: (time: string) => void;
    /** A slot held by this reservation stays choosable, so re-confirming it is not blocked by itself. */
    ownId?: string;
}

export const SlotPicker = ({ slots, value, onChange, ownId }: SlotPickerProps) => (
    <div className={styles.card__group}>
        <span className={styles.card__label}>Čas</span>
        <div className={styles.dialog__slots}>
            {slots.map((slot) => {
                const takenBy =
                    slot.booked && slot.booked.id !== ownId ? `${slot.booked.firstName} ${slot.booked.lastName}`.trim() : '';
                return (
                    <SlotOption key={slot.time} slot={slot} selected={slot.time === value} takenBy={takenBy} onPick={onChange} />
                );
            })}
            {slots.length === 0 ? <span className={styles.dialog__note}>V tento deň neskúšame.</span> : null}
        </div>
    </div>
);
