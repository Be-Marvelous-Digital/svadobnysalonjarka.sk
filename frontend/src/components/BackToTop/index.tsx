import { useCallback } from 'react';
import { useScrollState } from '@/hooks/useScrollState';
import styles from './BackToTop.module.less';

/** How far down the page has to be before climbing back is worth offering. */
const THRESHOLD = 500;

export const BackToTop = () => {
    const { offset } = useScrollState();
    const shown = offset > THRESHOLD;

    const toTop = useCallback(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
    }, []);

    return (
        <button
            type="button"
            className={[styles.toTop, shown && styles['toTop--shown']].filter(Boolean).join(' ')}
            onClick={toTop}
            // Kept in the DOM so it can fade, but out of reach while it is invisible.
            tabIndex={shown ? 0 : -1}
            aria-hidden={!shown}
            aria-label="Späť hore"
        >
            <span aria-hidden="true">↑</span>
        </button>
    );
};
