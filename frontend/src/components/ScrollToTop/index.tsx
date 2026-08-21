import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        // Otherwise the browser restores the old offset after this effect runs.
        if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    }, []);

    useEffect(() => {
        if (hash) return;
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname, hash]);

    return null;
};
