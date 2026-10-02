'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { CONTACT } from '@/data/contact';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { ROUTES } from '@/utils/routes';
import styles from './ConsentMap.module.scss';

/** The map is a third-party embed, so nothing is requested from Google until consent exists. */
export const ConsentMap = () => {
    const { consent, acceptAll } = useCookieConsent();

    const handleAllow = useCallback(() => acceptAll(), [acceptAll]);

    if (consent?.embeds) {
        return (
            <div className={styles.map}>
                <iframe src={CONTACT.mapEmbed} title={`Mapa – ${CONTACT.street}, Galanta`} loading="lazy" />
            </div>
        );
    }

    return (
        <div className={`${styles.map} ${styles['map--placeholder']}`}>
            <span className={styles.map__kicker}>Mapa je vypnutá</span>
            <p className={styles.map__text}>
                Mapu poskytuje Google Maps. Načítaním sa spojíte so servermi Googlu, ktorý pri tom môže ukladať cookies. Zapneme
                ju až s vaším súhlasom — podrobnosti sú v <Link href={ROUTES.privacy}>zásadách ochrany súkromia</Link>.
            </p>
            <Button variant="dark" size="sm" onClick={handleAllow}>
                Zobraziť mapu
            </Button>
            <span className={styles.map__address}>
                {CONTACT.street}, {CONTACT.city}
            </span>
        </div>
    );
};
