import { useMemo, useState } from 'react';
import { Chip } from '@/components/Chip';
import type { AdminPhoto } from '@/api/types';
import { CATEGORY_KEYS, CATEGORY_LABELS, type CategoryKey } from '@/data/collections';
import { useDialog } from '@/hooks/useDialog';
import styles from './Admin.module.less';

interface GalleryPickerProps {
    /** Shown in the heading so it is clear which position is being filled. */
    slotLabel: string;
    photos: AdminPhoto[];
    /** Opens on the category the photo is most likely to come from. */
    initialCategory?: CategoryKey;
    onChoose: (url: string) => void;
    onClose: () => void;
}

/**
 * Points a fixed position at a photo the gallery already holds. The file stays
 * where it is and is shared, so reusing a catalogue shot costs no extra storage.
 */
export const GalleryPicker = ({ slotLabel, photos, initialCategory, onChoose, onClose }: GalleryPickerProps) => {
    const ref = useDialog<HTMLDivElement>(onClose);
    const [category, setCategory] = useState<CategoryKey>(initialCategory ?? 'svadobne');

    const shown = useMemo(() => photos.filter((photo) => photo.category === category), [photos, category]);
    const countOf = (key: CategoryKey) => photos.filter((photo) => photo.category === key).length;

    return (
        <div className={styles.picker}>
            <div ref={ref} className={styles.picker__panel} role="dialog" aria-modal="true" aria-label="Vybrať z galérie">
                <div className={styles.picker__head}>
                    <div className={styles.slot__heading}>
                        <span className={styles.picker__title}>Vybrať z galérie</span>
                        <span className={styles.slot__hint}>Fotka sa použije na mieste „{slotLabel}“.</span>
                    </div>
                    <button type="button" className={`${styles.action} ${styles['action--link']}`} onClick={onClose}>
                        Zavrieť ✕
                    </button>
                </div>

                <div className={styles.gallery__tabs}>
                    {CATEGORY_KEYS.map((key) => (
                        <Chip key={key} selected={category === key} onClick={() => setCategory(key)}>
                            {CATEGORY_LABELS[key]} ({countOf(key)})
                        </Chip>
                    ))}
                </div>

                {shown.length === 0 ? (
                    <div className={styles.gallery__empty}>v tejto kategórii nie sú fotografie</div>
                ) : (
                    <div className={styles.picker__grid}>
                        {shown.map((photo) => (
                            <button
                                key={photo.id}
                                type="button"
                                className={styles.picker__tile}
                                onClick={() => onChoose(photo.url)}
                            >
                                <img src={photo.url} alt="" className={styles.slot__image} loading="lazy" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
