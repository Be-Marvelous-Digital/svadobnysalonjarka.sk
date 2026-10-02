import { memo, useCallback } from 'react';
import { Chip } from '@/components/Chip';
import { BOOKABLE_COLLECTIONS } from '@/data/collections';
import styles from './Admin.module.scss';

interface CategoryOptionProps {
    label: string;
    selected: boolean;
    onPick: (label: string) => void;
}

const CategoryOption = memo(({ label, selected, onPick }: CategoryOptionProps) => {
    // Picking the selected one again clears it; the type is optional on a phone booking.
    const pick = useCallback(() => onPick(selected ? '' : label), [label, onPick, selected]);

    return (
        <Chip size="compact" selected={selected} onClick={pick}>
            {label}
        </Chip>
    );
});

interface CategoryPickerProps {
    value: string;
    onChange: (label: string) => void;
}

export const CategoryPicker = ({ value, onChange }: CategoryPickerProps) => (
    <div className={styles.card__group}>
        <span className={styles.card__label}>Typ skúšky</span>
        <div className={styles.dialog__slots}>
            {BOOKABLE_COLLECTIONS.map((collection) => (
                <CategoryOption
                    key={collection.key}
                    label={collection.label}
                    selected={value === collection.label}
                    onPick={onChange}
                />
            ))}
        </div>
    </div>
);
