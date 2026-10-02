import styles from './StepIndicator.module.scss';

const LABELS = ['Termín', 'Kontakt', 'Potvrdenie'];

interface StepIndicatorProps {
    current: number;
}

export const StepIndicator = ({ current }: StepIndicatorProps) => (
    // The labels are hidden on small screens, so each step carries its own name
    // and the whole strip announces which one is active.
    <ol className={styles.steps} aria-label={`Krok ${current} z ${LABELS.length}: ${LABELS[current - 1] ?? ''}`}>
        {LABELS.map((label, position) => (
            <li key={label} className={styles.steps__item} aria-current={current === position + 1 ? 'step' : undefined}>
                <span
                    className={[styles.steps__dot, current >= position + 1 && styles['steps__dot--active']]
                        .filter(Boolean)
                        .join(' ')}
                    aria-hidden="true"
                >
                    {position + 1}
                </span>
                <span className={styles.steps__label}>{label}</span>
                {position < LABELS.length - 1 ? <span className={styles.steps__line} aria-hidden="true" /> : null}
            </li>
        ))}
    </ol>
);
