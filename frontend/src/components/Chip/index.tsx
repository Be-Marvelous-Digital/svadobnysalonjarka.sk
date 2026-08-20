import type { ReactNode } from 'react';
import styles from './Chip.module.less';

interface ChipProps {
    selected: boolean;
    onClick: () => void;
    size?: 'label' | 'time' | 'compact';
    disabled?: boolean;
    children: ReactNode;
}

export const Chip = ({ selected, onClick, size = 'label', disabled = false, children }: ChipProps) => (
    <button
        type="button"
        className={[styles.chip, styles[`chip--${size}`], selected && styles['chip--selected']].filter(Boolean).join(' ')}
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
    >
        {children}
    </button>
);
