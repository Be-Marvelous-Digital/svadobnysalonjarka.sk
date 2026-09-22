import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * A piece of view state kept in the query string, so a reload, a bookmark or the
 * back button all land where the person left off.
 *
 * Query string rather than a path segment on purpose: the layout keys <main> on
 * the pathname, so a path would remount the whole page and replay its entrance
 * animation on every tab click.
 */
export function useUrlState<T extends string>(
    key: string,
    allowed: readonly T[],
    fallback: T,
    /** History entry per change. Off for filters, which would otherwise pile up. */
    push = true,
): [T, (value: T) => void] {
    const [params, setParams] = useSearchParams();

    const raw = params.get(key);
    const value = allowed.includes(raw as T) ? (raw as T) : fallback;

    const set = useCallback(
        (next: T) => {
            setParams(
                (current) => {
                    const updated = new URLSearchParams(current);
                    // The default stays implicit, so the tidy URL is the common one.
                    if (next === fallback) updated.delete(key);
                    else updated.set(key, next);
                    return updated;
                },
                { replace: !push },
            );
        },
        [setParams, key, fallback, push],
    );

    return [value, set];
}
