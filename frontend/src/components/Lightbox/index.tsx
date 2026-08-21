import { useCallback, useEffect, useRef, type MouseEvent, type TouchEvent } from 'react';
import { useDialog } from '@/hooks/useDialog';
import styles from './Lightbox.module.less';

const SWIPE_THRESHOLD = 45;
/** Ignore gestures that are mostly vertical, so scrolling never pages the gallery. */
const SWIPE_MAX_DRIFT = 60;

interface LightboxProps {
    photos: string[];
    index: number;
    label: string;
    onClose: () => void;
    onNavigate: (nextIndex: number) => void;
}

export const Lightbox = ({ photos, index, label, onClose, onNavigate }: LightboxProps) => {
    const touchStart = useRef({ x: 0, y: 0 });
    const ref = useDialog<HTMLDivElement>(onClose);

    const goNext = useCallback(() => onNavigate((index + 1) % photos.length), [index, photos.length, onNavigate]);
    const goPrev = useCallback(() => onNavigate((index - 1 + photos.length) % photos.length), [index, photos.length, onNavigate]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight') goNext();
            if (event.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [goNext, goPrev]);

    // Keeps the next and previous frames warm so a swipe does not wait on a cold fetch.
    useEffect(() => {
        for (const offset of [1, -1]) {
            const neighbour = photos[(index + offset + photos.length) % photos.length];
            if (neighbour) new Image().src = neighbour;
        }
    }, [index, photos]);

    const onTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
        touchStart.current = { x: event.touches[0]?.clientX ?? 0, y: event.touches[0]?.clientY ?? 0 };
    }, []);

    const onTouchEnd = useCallback(
        (event: TouchEvent<HTMLDivElement>) => {
            const deltaX = (event.changedTouches[0]?.clientX ?? 0) - touchStart.current.x;
            const deltaY = (event.changedTouches[0]?.clientY ?? 0) - touchStart.current.y;
            if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaY) > SWIPE_MAX_DRIFT) return;
            if (deltaX < 0) goNext();
            else goPrev();
        },
        [goNext, goPrev],
    );

    const stop = useCallback((event: MouseEvent) => event.stopPropagation(), []);

    const src = photos[index];
    if (!src) return null;

    return (
        <div
            ref={ref}
            className={styles.lightbox}
            onClick={onClose}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="dialog"
            aria-modal="true"
            aria-label={`${label} — fotografia ${index + 1} z ${photos.length}`}
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
