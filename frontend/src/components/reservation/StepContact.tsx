import { Button } from '@/components/Button';
import { Field, TextInput } from '@/components/Field';
import type { FieldErrors } from '@/hooks/reservationValidation';
import type { ReservationDraft } from '@/hooks/useReservationForm';
import styles from './ReservationForm.module.less';

interface StepContactProps {
    draft: ReservationDraft;
    valid: boolean;
    errors: FieldErrors;
    onChange: (changes: Partial<ReservationDraft>) => void;
    onBack: () => void;
}

export const StepContact = ({ draft, valid, errors, onChange, onBack }: StepContactProps) => (
    <div className={styles.step}>
        <div className={styles.step__contactGrid}>
            <Field label="Meno" error={errors.firstName}>
                <TextInput
                    type="text"
                    value={draft.firstName}
                    placeholder="Jana"
                    autoComplete="given-name"
                    onChange={(event) => onChange({ firstName: event.target.value })}
                />
            </Field>
            <Field label="Priezvisko" error={errors.lastName}>
                <TextInput
                    type="text"
                    value={draft.lastName}
                    placeholder="Nováková"
                    autoComplete="family-name"
                    onChange={(event) => onChange({ lastName: event.target.value })}
                />
            </Field>
            <Field label="Telefón" error={errors.phone}>
                <TextInput
                    type="tel"
                    value={draft.phone}
                    placeholder="+421 900 000 000"
                    autoComplete="tel"
                    onChange={(event) => onChange({ phone: event.target.value })}
                />
            </Field>
            <Field label="E-mail" error={errors.email}>
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
            <Button type="submit" variant="dark" aria-disabled={!valid}>
                Skontrolovať
            </Button>
        </div>
    </div>
);
