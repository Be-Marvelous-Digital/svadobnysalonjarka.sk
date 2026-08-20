import { useCallback, useEffect, useState } from 'react';

/** Bump when the categories change, so a stored decision stops counting as informed consent. */
export const CONSENT_VERSION = 1;

const STORAGE_KEY = 'jarka_consent';
const CHANGE_EVENT = 'jarka:consent';

export interface ConsentRecord {
    /** Third-party embeds — currently only the Google Maps frame on the contact page. */
    embeds: boolean;
    version: number;
    decidedAt: string;
}

function read(): ConsentRecord | null {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
        if (parsed.version !== CONSENT_VERSION || typeof parsed.embeds !== 'boolean') return null;
        return { embeds: parsed.embeds, version: CONSENT_VERSION, decidedAt: parsed.decidedAt ?? '' };
    } catch {
        return null;
    }
}

function write(embeds: boolean): void {
    const record: ConsentRecord = { embeds, version: CONSENT_VERSION, decidedAt: new Date().toISOString() };
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
        // Private mode or a full quota — the banner reappears next visit, which is the safe default.
    }
    window.dispatchEvent(new CustomEvent<ConsentRecord>(CHANGE_EVENT, { detail: record }));
}

export function openConsentSettings(): void {
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Nothing stored to clear.
    }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: null }));
}

interface ConsentState {
    consent: ConsentRecord | null;
    decided: boolean;
    acceptAll: () => void;
    rejectAll: () => void;
}

export function useCookieConsent(): ConsentState {
    const [consent, setConsent] = useState<ConsentRecord | null>(() => read());

    useEffect(() => {
        const sync = () => setConsent(read());
        window.addEventListener(CHANGE_EVENT, sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener(CHANGE_EVENT, sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    const acceptAll = useCallback(() => write(true), []);
    const rejectAll = useCallback(() => write(false), []);

    return { consent, decided: consent !== null, acceptAll, rejectAll };
}
