import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Field, TextInput } from '@/components/Field';
import { BOOKABLE_COLLECTIONS } from '@/data/collections';
import { useAvailability } from '@/hooks/useAvailability';
import type { FieldErrors } from '@/hooks/reservationValidation';
import type { ReservationDraft } from '@/hooks/useReservationForm';
import { formatLongDate, todayKey } from '@/utils/date';
import styles from './ReservationForm.module.less';

interface StepScheduleProps {
    draft: ReservationDraft;
    valid: boolean;
    errors: FieldErrors;
    onChange: (changes: Partial<ReservationDraft>) => void;
}

export const StepSchedule = ({ draft, valid, errors, onChange }: StepScheduleProps) => {
    const { slots, loading } = useAvailability(draft.date);

    const summary = valid ? `${draft.cat} · ${formatLongDate(draft.date)} · ${draft.time}` : 'Vyberte typ šiat, dátum a čas.';

    return (
        <div className={styles.step}>
            <div className={styles.step__group}>
                <span className={styles.step__label}>Čo si chcete vyskúšať</span>
                {errors.cat ? <span className={styles.step__error}>{errors.cat}</span> : null}
                <div className={styles.step__chips}>
                    {BOOKABLE_COLLECTIONS.map((collection) => (
                        <Chip
                            key={collection.key}
                            selected={draft.cat === collection.label}
                            onClick={() => onChange({ cat: collection.label })}
                        >
                            {collection.label}
                        </Chip>
                    ))}
                </div>
            </div>

            <div className={styles.step__columns}>
                <Field
                    label="Preferovaný dátum"
                    hint={draft.date ? formatLongDate(draft.date) : 'Vyberte dátum, ukážeme vám voľné časy.'}
                    error={errors.date}
                >
                    <TextInput
                        type="date"
                        value={draft.date}
                        min={todayKey()}
                        onChange={(event) => onChange({ date: event.target.value, time: '' })}
                    />
                </Field>

                <div className={styles.step__group}>
                    <span className={styles.step__label}>Preferovaný čas</span>
                    {errors.time ? <span className={styles.step__error}>{errors.time}</span> : null}
                    <div className={styles.step__slots}>
                        {slots.map((slot) => (
                            <Chip key={slot} size="time" selected={draft.time === slot} onClick={() => onChange({ time: slot })}>
                                {slot}
                            </Chip>
                        ))}
                    </div>
                    {draft.date && !loading && slots.length === 0 ? (
                        <span className={styles.step__error} role="status">
                            V tento deň nemáme voľný termín, vyberte, prosím, iný deň.
                        </span>
                    ) : null}
                </div>
            </div>

            <div className={styles.step__actions}>
                <span className={styles.step__summary}>{summary}</span>
                <Button type="submit" variant="dark" aria-disabled={!valid}>
                    Pokračovať
                </Button>
            </div>
        </div>
    );
};
