import { useCallback, useRef, type ChangeEvent } from 'react';
import type { AdminPhoto } from '@/api/types';
import styles from './Admin.module.less';

interface GalleryTileProps {
    photo: AdminPhoto;
    position: number;
    busy: boolean;
    onReplace: (id: string, file: File) => void;
    onRemove: (id: string) => void;
}

export const GalleryTile = ({ photo, position, busy, onReplace, onRemove }: GalleryTileProps) => {
    const fileRef = useRef<HTMLInputElement>(null);

    const pickReplacement = useCallback(() => fileRef.current?.click(), []);

    const handleFile = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) onReplace(photo.id, file);
            event.target.value = '';
        },
        [onReplace, photo.id],
    );

    const handleRemove = useCallback(() => {
        if (window.confirm('Zmazať fotografiu? Odstráni sa aj súbor z úložiska a nedá sa vrátiť späť.')) {
            onRemove(photo.id);
        }
    }, [onRemove, photo.id]);

    return (
        <div className={styles.gallery__item}>
            <div className={styles.gallery__frame}>
                <img src={photo.url} alt={`Fotografia ${position}`} className={styles.gallery__image} loading="lazy" />
            </div>
            <div className={styles.gallery__meta}>
                <span>{String(position).padStart(2, '0')}</span>
                <span className={styles.gallery__actions}>
                    <button
                        type="button"
                        className={`${styles.action} ${styles['action--link']}`}
                        disabled={busy}
                        onClick={pickReplacement}
                    >
                        Nahradiť
                    </button>
                    <button
                        type="button"
                        className={`${styles.action} ${styles['action--link']}`}
                        disabled={busy}
                        onClick={handleRemove}
                    >
                        Zmazať
                    </button>
                </span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
        </div>
    );
};
