import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import type { CategoryKey } from '@/data/collections';
import styles from './Admin.module.scss';

interface CategoryIntakeProps {
    category: CategoryKey;
    busy: boolean;
    error: string;
    onUpload: (category: CategoryKey, files: FileList) => void;
}

/** Drop photos here or pick them; either way they are resized and re-encoded server side. */
export const CategoryIntake = ({ category, busy, error, onUpload }: CategoryIntakeProps) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [over, setOver] = useState(false);

    const pickFiles = useCallback(() => fileRef.current?.click(), []);

    const handleFiles = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.files?.length) onUpload(category, event.target.files);
            event.target.value = '';
        },
        [onUpload, category],
    );

    const handleDragOver = useCallback((event: DragEvent) => {
        event.preventDefault();
        setOver(true);
    }, []);

    const handleDragLeave = useCallback(() => setOver(false), []);

    const handleDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault();
            setOver(false);
            const { files } = event.dataTransfer;
            if (files?.length) onUpload(category, files);
        },
        [onUpload, category],
    );

    const className = [styles.drop, over && styles['drop--over'], busy && styles['drop--busy']].filter(Boolean).join(' ');

    return (
        <div className={styles.drop__wrap}>
            {/* The whole area is the button — a target this size is easier to hit than
                the label inside it, which is why the label is a span and not a button. */}
            <button
                type="button"
                className={className}
                disabled={busy}
                onClick={pickFiles}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <span className={styles.drop__title}>
                    {busy ? 'Nahrávam…' : over ? 'Pustite fotky sem' : 'Pretiahnite fotky sem'}
                </span>

                <span className={`${styles.action} ${styles['action--outline']} ${styles.drop__pick}`}>Vybrať z počítača</span>

                <span className={styles.drop__note}>Zmenšia sa a prevedú do WebP. Naraz aj viac fotiek.</span>
            </button>

            {error ? (
                <span role="alert" className={styles.card__label}>
                    {error}
                </span>
            ) : null}

            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
        </div>
    );
};
