import { useState } from 'react';
import { Chip } from '@/components/Chip';
import { TextInput } from '@/components/Field';
import { BOOKABLE_COLLECTIONS } from '@/data/collections';
import type { OwnerReservationInput } from '@/hooks/useAdminData';
import { useAvailability } from '@/hooks/useAvailability';
import { todayKey } from '@/utils/date';
import styles from './Admin.module.less';

interface OwnerReservationFormProps {
    defaultDate: string;
    onCreate: (input: OwnerReservationInput) => void;
}

export const OwnerReservationForm = ({ defaultDate, onCreate }: OwnerReservationFormProps) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [date, setDate] = useState(defaultDate);
    const [cat, setCat] = useState(BOOKABLE_COLLECTIONS[0]?.label ?? '');
    const [time, setTime] = useState('');
    const { slots } = useAvailability(date);

    const valid = Boolean(name.trim() && date && time);

    return (
        <div className={styles.card}>
            <div className={styles.card__group}>
                <span className={styles.card__title}>Vlastná rezervácia</span>
                <span className={styles.card__note}>
                    Skúška dohodnutá telefonicky alebo osobne. Uloží sa rovno ako potvrdená a obsadí termín.
                </span>
            </div>

            <div className={styles.card__side}>
                <div className={styles.blockForm__grid}>
                    <TextInput
                        compact
                        type="text"
                        value={name}
                        placeholder="Meno klientky"
                        onChange={(event) => setName(event.target.value)}
                    />
                    <TextInput
                        compact
                        type="tel"
                        value={phone}
                        placeholder="Telefón (nepovinné)"
                        onChange={(event) => setPhone(event.target.value)}
                    />
                    <TextInput
                        compact
                        type="date"
                        value={date}
                        min={todayKey()}
                        onChange={(event) => {
                            setDate(event.target.value);
                            setTime('');
                        }}
                    />
                </div>

                <div className={styles.card__chips}>
                    {BOOKABLE_COLLECTIONS.map((collection) => (
                        <Chip
                            key={collection.key}
                            size="compact"
                            selected={cat === collection.label}
                            onClick={() => setCat(collection.label)}
                        >
                            {collection.label}
                        </Chip>
                    ))}
                </div>

                <div className={styles.card__chips}>
                    {slots.map((slot) => (
                        <Chip key={slot} size="compact" selected={time === slot} onClick={() => setTime(slot)}>
                            {slot}
                        </Chip>
                    ))}
                </div>

                <button
                    type="button"
                    className={`${styles.action} ${styles['action--primary']}`}
                    disabled={!valid}
                    onClick={() => {
                        onCreate({ name: name.trim(), phone: phone.trim(), cat, date, time, kind: 'majitelka' });
                        setName('');
                        setPhone('');
                        setTime('');
                    }}
                >
                    Pridať ako potvrdenú
                </button>
            </div>
        </div>
    );
};
