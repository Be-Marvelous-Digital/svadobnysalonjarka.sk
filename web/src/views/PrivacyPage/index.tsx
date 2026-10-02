'use client';

import { useCallback } from 'react';
import { Button } from '@/components/Button';
import { LegalPage } from '@/components/LegalPage';
import { PRIVACY_SECTIONS } from '@/data/legal';
import { openConsentSettings, useCookieConsent } from '@/hooks/useCookieConsent';

export const PrivacyPage = () => {
    const { consent } = useCookieConsent();

    const handleReopen = useCallback(() => openConsentSettings(), []);

    const status = consent
        ? consent.embeds
            ? 'Aktuálne máte povolený vložený obsah (mapa Google Maps).'
            : 'Aktuálne máte vložený obsah odmietnutý — mapa sa nenačíta.'
        : 'Zatiaľ ste sa nerozhodli. Pri ďalšom načítaní stránky sa vás opýtame.';

    return (
        <LegalPage
            kicker="Právne informácie"
            title="Zásady ochrany súkromia"
            lead="Zbierame len to, čo potrebujeme na dohodnutie termínu skúšky. Žiadna analytika, žiadne reklamné sledovanie, žiadny predaj údajov tretím stranám."
            sections={PRIVACY_SECTIONS}
            footnote={
                <>
                    <span>{status}</span>
                    <Button variant="outline" size="sm" onClick={handleReopen}>
                        Zmeniť nastavenia súkromia
                    </Button>
                </>
            }
        />
    );
};
