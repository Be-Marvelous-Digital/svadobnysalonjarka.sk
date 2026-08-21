import { Button } from '@/components/Button';
import { Field, TextInput } from '@/components/Field';
import type { ReservationDraft } from '@/hooks/useReservationForm';
import styles from './ReservationForm.module.less';

interface StepContactProps {
    draft: ReservationDraft;
    valid: boolean;
    onChange: (changes: Partial<ReservationDraft>) => void;
    onBack: () => void;
}

export const StepContact = ({ draft, valid, onChange, onBack }: StepContactProps) => (
    <div className={styles.step}>
        <div className={styles.step__contactGrid}>
            <Field label="Meno a priezvisko" className={styles.step__wide}>
                <TextInput
                    type="text"
                    value={draft.name}
                    placeholder="Jana Nováková"
                    autoComplete="name"
                    onChange={(event) => onChange({ name: event.target.value })}
                />
            </Field>
            <Field label="Telefón">
                <TextInput
                    type="tel"
                    value={draft.phone}
                    placeholder="+421 900 000 000"
                    autoComplete="tel"
                    onChange={(event) => onChange({ phone: event.target.value })}
                />
            </Field>
            <Field label="E-mail">
                <TextInput
                    type="email"
                    value={draft.email}
                    placeholder="jana@email.sk"
                    autoComplete="email"
                    onChange={(event) => onChange({ email: event.target.value })}
                />
            </Field>
        </div>

        <p className={styles.step__note}>
            Na telefónne číslo vás zavoláme kvôli potvrdeniu termínu. Údaje použijeme len na dohodnutie skúšky.
        </p>

        <div className={styles.step__actions}>
            <button type="button" className={styles.step__back} onClick={onBack}>
                ← Späť
            </button>
            <Button type="submit" variant="dark" disabled={!valid}>
                Skontrolovať
            </Button>
        </div>
    </div>
);
