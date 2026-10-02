import { useEffect, useRef, type RefObject } from 'react';

/** Fades a section in the first time it scrolls into view; already-revealed nodes are left alone. */
export function useReveal<T extends HTMLElement>(): RefObject<T | null> {
    const ref = useRef<T>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            node.dataset.revealed = 'true';
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    (entry.target as HTMLElement).dataset.revealed = 'true';
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return ref;
}
