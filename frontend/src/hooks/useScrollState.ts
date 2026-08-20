import { useEffect, useState } from 'react';

interface ScrollState {
    scrolled: boolean;
    navHidden: boolean;
}

/** Tracks whether the page has left the top and whether the header should slide away. */
export function useScrollState(): ScrollState {
    const [state, setState] = useState<ScrollState>({ scrolled: false, navHidden: false });

    useEffect(() => {
        let lastY = window.scrollY;

        const onScroll = () => {
            const y = window.scrollY;
            const goingDown = y > lastY + 4;
            const goingUp = y < lastY - 4;
            lastY = y;

            setState((current) => {
                const scrolled = y > 40;
                let navHidden = current.navHidden;
                if (goingDown && y > 160) navHidden = true;
                else if (goingUp || y <= 160) navHidden = false;
                if (scrolled === current.scrolled && navHidden === current.navHidden) return current;
                return { scrolled, navHidden };
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return state;
}
