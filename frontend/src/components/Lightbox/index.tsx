import { useCallback, useEffect, useRef, type MouseEvent, type TouchEvent } from 'react';
import styles from './Lightbox.module.less';

const SWIPE_THRESHOLD = 45;

interface LightboxProps {
    photos: string[];
    index: number;
    label: string;
    onClose: () => void;
    onNavigate: (nextIndex: number) => void;
}

export const Lightbox = ({ photos, index, label, onClose, onNavigate }: LightboxProps) => {
    const touchStartX = useRef(0);

    const goNext = useCallback(() => onNavigate((index + 1) % photos.length), [index, photos.length, onNavigate]);
    const goPrev = useCallback(() => onNavigate((index - 1 + photos.length) % photos.length), [index, photos.length, onNavigate]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'ArrowRight') goNext();
            if (event.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', onKeyDown);
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previous;
        };
    }, [onClose, goNext, goPrev]);

    const onTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
        touchStartX.current = event.touches[0]?.clientX ?? 0;
    }, []);

    const onTouchEnd = useCallback(
        (event: TouchEvent<HTMLDivElement>) => {
            const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
            if (Math.abs(delta) < SWIPE_THRESHOLD) return;
            if (delta < 0) goNext();
            else goPrev();
        },
        [goNext, goPrev],
    );

    const stop = useCallback((event: MouseEvent) => event.stopPropagation(), []);

    const src = photos[index];
    if (!src) return null;

    return (
        <div
            className={styles.lightbox}
            onClick={onClose}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="presentation"
        >
            <button type="button" className={styles.lightbox__close} onClick={onClose}>
                Zavrieť ✕
            </button>
            <button
                type="button"
                className={`${styles.lightbox__nav} ${styles['lightbox__nav--prev']}`}
                onClick={(event) => {
                    stop(event);
                    goPrev();
                }}
                aria-label="Predchádzajúca fotografia"
            >
                ‹
            </button>
            <img src={src} alt={label} className={styles.lightbox__image} onClick={stop} />
            <button
                type="button"
                className={`${styles.lightbox__nav} ${styles['lightbox__nav--next']}`}
                onClick={(event) => {
                    stop(event);
                    goNext();
                }}
                aria-label="Ďalšia fotografia"
            >
                ›
            </button>
            <span className={styles.lightbox__label}>{`${label} · ${index + 1} / ${photos.length}`}</span>
        </div>
    );
};
