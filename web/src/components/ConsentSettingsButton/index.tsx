'use client';

import type { ReactNode } from 'react';
import { openConsentSettings } from '@/hooks/useCookieConsent';

interface ConsentSettingsButtonProps {
    className?: string;
    children: ReactNode;
}

export const ConsentSettingsButton = ({ className, children }: ConsentSettingsButtonProps) => (
    <button type="button" className={className} onClick={openConsentSettings}>
        {children}
    </button>
);
