import { useCallback, useRef, type ChangeEvent, type DragEvent } from 'react';
import type { AdminPhoto } from '@/api/types';
import styles from './Admin.module.scss';
import { thumbOf } from '@/utils/photos';

interface DragHandlers {
    draggable: true;
    onDragStart: (event: DragEvent) => void;
    onDragEnter: (event: DragEvent) => void;
    onDragOver: (event: DragEvent) => void;
    onDrop: (event: DragEvent) => void;
    onDragEnd: () => void;
}

interface GalleryTileProps {
    photo: AdminPhoto;
    position: number;
    total: number;
    busy: boolean;
    dragging: boolean;
    dragProps: DragHandlers;
    selected: boolean;
    onToggleSelect: (id: string) => void;
    onMove: (id: string, offset: number) => void;
    onReplace: (id: string, file: File) => void;
    onRemove: (id: string) => void;
}

export const GalleryTile = ({
    photo,
    position,
    total,
    busy,
    dragging,
    dragProps,
    selected,
    onToggleSelect,
    onMove,
    onReplace,
    onRemove,
}: GalleryTileProps) => {
    const fileRef = useRef<HTMLInputElement>(null);

    const pickReplacement = useCallback(() => fileRef.current?.click(), []);
    const moveEarlier = useCallback(() => onMove(photo.id, -1), [onMove, photo.id]);
    const moveLater = useCallback(() => onMove(photo.id, 1), [onMove, photo.id]);

    const handleFile = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) onReplace(photo.id, file);
            event.target.value = '';
        },
        [onReplace, photo.id],
    );

    const handleRemove = useCallback(() => onRemove(photo.id), [onRemove, photo.id]);
    const handleToggle = useCallback(() => onToggleSelect(photo.id), [onToggleSelect, photo.id]);

    const className = [
        styles.gallery__item,
        dragging && styles['gallery__item--dragging'],
        selected && styles['gallery__item--selected'],
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={className} {...dragProps}>
            <div className={styles.gallery__frame}>
                <img src={thumbOf(photo.url)} alt={`Fotografia ${position}`} className={styles.gallery__image} loading="lazy" />
                <span className={styles.gallery__grip} aria-hidden="true">
                    ⠿
                </span>
                <label className={styles.gallery__pick}>
                    <input type="checkbox" checked={selected} onChange={handleToggle} />
                    <span className={styles.gallery__pickBox} aria-hidden="true" />
                    <span className={styles.srOnly}>Vybrať fotografiu {position}</span>
                </label>
            </div>

            <div className={styles.gallery__meta}>
                <span>
                    {String(position).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </span>
                <span className={styles.gallery__actions}>
                    <button
                        type="button"
                        className={`${styles.action} ${styles['action--step']}`}
                        disabled={busy || position === 1}
                        onClick={moveEarlier}
                        aria-label={`Posunúť fotografiu ${position} dopredu`}
                    >
                        ←
                    </button>
                    <button
                        type="button"
                        className={`${styles.action} ${styles['action--step']}`}
                        disabled={busy || position === total}
                        onClick={moveLater}
                        aria-label={`Posunúť fotografiu ${position} dozadu`}
                    >
                        →
                    </button>
                </span>
            </div>

            <div className={styles.gallery__meta}>
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
            </div>

            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
        </div>
    );
};
