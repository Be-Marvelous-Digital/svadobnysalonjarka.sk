import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/** View state kept in the query string, so reload, bookmark and back all land where the person left off. */
export function useUrlState<T extends string>(
    key: string,
    allowed: readonly T[],
    fallback: T,
    /** History entry per change. Off for filters, which would otherwise pile up. */
    push = true,
): [T, (value: T) => void] {
    const params = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const raw = params.get(key);
    const value = allowed.includes(raw as T) ? (raw as T) : fallback;

    const set = useCallback(
        (next: T) => {
            const updated = new URLSearchParams(window.location.search);
            if (next === fallback) updated.delete(key);
            else updated.set(key, next);
            const query = updated.toString();
            const url = query ? `${pathname}?${query}` : pathname;
            if (push) router.push(url, { scroll: false });
            else router.replace(url, { scroll: false });
        },
        [router, pathname, key, fallback, push],
    );

    return [value, set];
}
