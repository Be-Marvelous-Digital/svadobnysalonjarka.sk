import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * Everything an overlay owes a keyboard user: locked background scroll, Escape to
 * leave, Tab kept inside, and focus handed back to whatever opened it.
 */
export function useDialog<T extends HTMLElement>(onClose: () => void): RefObject<T | null> {
    const ref = useRef<T>(null);

    useEffect(() => {
        const node = ref.current;
        const opener = document.activeElement as HTMLElement | null;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        node?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
                return;
            }
            if (event.key !== 'Tab' || !node) return;

            const targets = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => element.offsetParent !== null);
            const first = targets[0];
            const last = targets[targets.length - 1];
            if (!first || !last) return;

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            opener?.focus();
        };
    }, [onClose]);

    return ref;
}
