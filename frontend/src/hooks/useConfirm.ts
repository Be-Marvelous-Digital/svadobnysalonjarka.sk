import { useCallback, useState } from 'react';

export interface ConfirmRequest {
    title: string;
    body: string;
    /** Wording on the button that goes through with it. */
    confirmLabel: string;
    onConfirm: () => void;
}

/**
 * Holds a pending destructive action until it is answered. The browser's own
 * confirm() blocks the page, cannot be styled and reads as a security warning
 * from the site rather than a question from the admin.
 */
export function useConfirm() {
    const [pending, setPending] = useState<ConfirmRequest | null>(null);

    const ask = useCallback((request: ConfirmRequest) => setPending(request), []);
    const cancel = useCallback(() => setPending(null), []);
    const accept = useCallback(() => {
        pending?.onConfirm();
        setPending(null);
    }, [pending]);

    return { pending, ask, cancel, accept };
}
