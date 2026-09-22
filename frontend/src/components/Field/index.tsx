import { Children, cloneElement, isValidElement, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './Field.module.less';

interface FieldProps {
    label: string;
    hint?: ReactNode;
    error?: ReactNode;
    children: ReactNode;
    className?: string;
}

/**
 * The wrapping label ties the control to its name. The hint and the error have to
 * be tied on separately, or someone using a screen reader hears the field and not
 * the reason it was refused, so they are given ids and pinned onto the control
 * itself. `alert` announces the error the moment it appears, which is the only
 * way validation reaches a person who cannot see it.
 */
export const Field = ({ label, hint, error, children, className }: FieldProps) => {
    const id = useId();
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

    const control = Children.map(children, (child) =>
        isValidElement<{ 'aria-describedby'?: string; 'aria-invalid'?: boolean }>(child)
            ? cloneElement(child, { 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })
            : child,
    );

    return (
        <label className={[styles.field, className].filter(Boolean).join(' ')}>
            <span className={styles.field__label}>{label}</span>
            {control}
            {hint ? (
                <span id={hintId} className={styles.field__hint}>
                    {hint}
                </span>
            ) : null}
            {error ? (
                <span id={errorId} role="alert" className={styles.field__error}>
                    {error}
                </span>
            ) : null}
        </label>
    );
};

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    compact?: boolean;
}

export const TextInput = ({ compact = false, className, ...rest }: TextInputProps) => (
    <input className={[styles.input, compact && styles['input--compact'], className].filter(Boolean).join(' ')} {...rest} />
);
