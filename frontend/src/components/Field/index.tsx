import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './Field.module.less';

interface FieldProps {
    label: string;
    hint?: ReactNode;
    error?: ReactNode;
    children: ReactNode;
    className?: string;
}

export const Field = ({ label, hint, error, children, className }: FieldProps) => (
    <label className={[styles.field, className].filter(Boolean).join(' ')}>
        <span className={styles.field__label}>{label}</span>
        {children}
        {hint ? <span className={styles.field__hint}>{hint}</span> : null}
        {error ? <span className={styles.field__error}>{error}</span> : null}
    </label>
);

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    compact?: boolean;
}

export const TextInput = ({ compact = false, className, ...rest }: TextInputProps) => (
    <input className={[styles.input, compact && styles['input--compact'], className].filter(Boolean).join(' ')} {...rest} />
);
