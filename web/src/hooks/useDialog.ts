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

        // overflow:hidden alone does not hold here. On body it only reaches the
        // viewport when body's own overflow is visible, and global.less sets
        // overflow-x; on html it stops the scroll but throws the page to the top.
        // Pinning body at its current offset keeps the page exactly where it was.
        const scrollY = window.scrollY;
        const gap = window.innerWidth - document.documentElement.clientWidth;
        const previous = {
            position: document.body.style.position,
            top: document.body.style.top,
            width: document.body.style.width,
            paddingRight: document.body.style.paddingRight,
        };

        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        // Without this the page shifts sideways as the scrollbar goes.
        if (gap > 0) document.body.style.paddingRight = `${gap}px`;

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

        // pointerdown, not click: registered after the pointerdown that opened the
        // dialog, so the opening press cannot close it again on the way up.
        const onPointerDown = (event: PointerEvent) => {
            if (node && !node.contains(event.target as Node)) onClose();
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointerdown', onPointerDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('pointerdown', onPointerDown);
            document.body.style.position = previous.position;
            document.body.style.top = previous.top;
            document.body.style.width = previous.width;
            document.body.style.paddingRight = previous.paddingRight;
            // Releasing the pin drops the page to the top unless it is put back.
            window.scrollTo(0, scrollY);
            opener?.focus();
        };
    }, [onClose]);

    return ref;
}
