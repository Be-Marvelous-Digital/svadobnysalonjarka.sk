import { useCallback, useSyncExternalStore } from 'react';

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

function readRaw(): string | null {
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

function parse(raw: string | null): ConsentRecord | null {
    if (!raw) return null;
    try {
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

function subscribe(onChange: () => void): () => void {
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
        window.removeEventListener(CHANGE_EVENT, onChange);
        window.removeEventListener('storage', onChange);
    };
}

// The server cannot see localStorage, so it renders as if undecided-but-unknown.
const SERVER_SNAPSHOT = undefined;

interface ConsentState {
    consent: ConsentRecord | null;
    /** False until the stored decision has been read in the browser. */
    known: boolean;
    decided: boolean;
    acceptAll: () => void;
    rejectAll: () => void;
}

export function useCookieConsent(): ConsentState {
    const raw = useSyncExternalStore<string | null | undefined>(subscribe, readRaw, () => SERVER_SNAPSHOT);
    const known = raw !== undefined;
    const consent = known ? parse(raw) : null;

    const acceptAll = useCallback(() => write(true), []);
    const rejectAll = useCallback(() => write(false), []);

    return { consent, known, decided: consent !== null, acceptAll, rejectAll };
}
