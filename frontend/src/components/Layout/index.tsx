import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BackToTop } from '@/components/BackToTop';
import { CookieBar } from '@/components/CookieBar';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { MobileBar, MobileBarSpacer } from '@/components/MobileBar';
import { MobileDrawer } from '@/components/MobileDrawer';
import { MOBILE_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';
import { useScrollState } from '@/hooks/useScrollState';
import { ROUTES } from '@/utils/routes';
import styles from './Layout.module.less';

export const Layout = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { scrolled, navHidden } = useScrollState();
    const isMobile = useMediaQuery(MOBILE_QUERY);
    const { pathname } = useLocation();

    const openDrawer = useCallback(() => setDrawerOpen(true), []);
    const closeDrawer = useCallback(() => setDrawerOpen(false), []);

    const onHomeHero = pathname === ROUTES.home && !scrolled;
    const headerHidden = navHidden && !drawerOpen;

    // Sticky elements inside the page have to know whether the header is still
    // there to clear; it slides away on the way down.
    useEffect(() => {
        document.documentElement.style.setProperty('--header-offset', headerHidden ? '0px' : 'var(--header-height)');
    }, [headerHidden]);

    return (
        <>
            <a href="#obsah" className={styles.skipLink}>
                Preskočiť na obsah
            </a>
            <Header transparent={onHomeHero} hidden={headerHidden} drawerOpen={drawerOpen} onOpenDrawer={openDrawer} />
            <main
                id="obsah"
                key={pathname}
                className={[styles.main, drawerOpen && styles['main--held']].filter(Boolean).join(' ')}
            >
                <Outlet />
            </main>
            <Footer />
            {isMobile && !drawerOpen ? (
                <>
                    <MobileBarSpacer />
                    <MobileBar />
                </>
            ) : null}
            {drawerOpen ? <MobileDrawer onClose={closeDrawer} /> : null}
            <BackToTop />
            <CookieBar />
        </>
    );
};
