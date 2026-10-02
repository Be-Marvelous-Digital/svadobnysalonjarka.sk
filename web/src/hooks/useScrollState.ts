import { useEffect, useState } from 'react';

interface ScrollState {
    scrolled: boolean;
    navHidden: boolean;
    /** Distance from the top, for anything that needs a threshold of its own. */
    offset: number;
}

/** Tracks whether the page has left the top and whether the header should slide away. */
export function useScrollState(): ScrollState {
    const [state, setState] = useState<ScrollState>({ scrolled: false, navHidden: false, offset: 0 });

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
                // Rounded to a step so a pixel of scroll does not re-render the tree.
                const offset = Math.round(y / 50) * 50;
                if (scrolled === current.scrolled && navHidden === current.navHidden && offset === current.offset) return current;
                return { scrolled, navHidden, offset };
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return state;
}
