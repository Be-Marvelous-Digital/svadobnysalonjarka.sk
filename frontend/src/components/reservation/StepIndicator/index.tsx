import styles from './StepIndicator.module.less';

const LABELS = ['Termín', 'Kontakt', 'Potvrdenie'];

interface StepIndicatorProps {
    current: number;
}

export const StepIndicator = ({ current }: StepIndicatorProps) => (
    <div className={styles.steps}>
        {LABELS.map((label, position) => (
            <div key={label} className={styles.steps__item}>
                <span
                    className={[styles.steps__dot, current >= position + 1 && styles['steps__dot--active']]
                        .filter(Boolean)
                        .join(' ')}
                >
                    {position + 1}
                </span>
                <span className={styles.steps__label}>{label}</span>
                {position < LABELS.length - 1 ? <span className={styles.steps__line} /> : null}
            </div>
        ))}
    </div>
);
