'use client';

import Link from 'next/link';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { ROUTES } from '@/utils/routes';
import styles from './CookieBar.module.scss';

export const CookieBar = () => {
    const { known, decided, acceptAll, rejectAll } = useCookieConsent();

    if (!known || decided) return null;

    return (
        <div className={styles.bar} role="dialog" aria-modal="false" aria-labelledby="cookie-bar-title">
            <div className={styles.bar__inner}>
                <div className={styles.bar__copy}>
                    <span id="cookie-bar-title" className={styles.bar__title}>
                        Súkromie na tejto stránke
                    </span>
                    <p className={styles.bar__text}>
                        Nevyhnutné cookies potrebujeme na fungovanie stránky a nedajú sa vypnúť. Navyše vieme zobraziť mapu z
                        Google Maps na stránke Kontakt — tá načíta obsah z Googlu a môže ukladať cookies. Zapneme ju len s vaším
                        súhlasom. Nepoužívame analytiku ani reklamné cookies. Viac v{' '}
                        <Link href={ROUTES.privacy}>zásadách ochrany súkromia</Link>.
                    </p>
                </div>

                <div className={styles.bar__actions}>
                    <button type="button" className={`${styles.bar__button} ${styles['bar__button--ghost']}`} onClick={rejectAll}>
                        Odmietnuť
                    </button>
                    <button type="button" className={`${styles.bar__button} ${styles['bar__button--solid']}`} onClick={acceptAll}>
                        Povoliť
                    </button>
                </div>
            </div>
        </div>
    );
};
