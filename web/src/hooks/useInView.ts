import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Whether the element is on screen. Used to switch a toolbar between sticky and
 * static, so it only follows the thing it acts on while that thing is in view.
 */
export function useInView<T extends HTMLElement>(): [RefObject<T | null>, boolean] {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node || typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }

        const observer = new IntersectionObserver((entries) => setInView(entries.some((entry) => entry.isIntersecting)));
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return [ref, inView];
}
