import type { CategoryKey } from '@/data/collections';

export const ROUTES = {
    home: '/',
    prices: '/ceny',
    about: '/o-salone',
    contact: '/kontakt',
    reservation: '/rezervacia',
    privacy: '/ochrana-sukromia',
    terms: '/zasady-pouzivania',
    admin: '/admin',
} as const;

export function collectionPath(key: CategoryKey): string {
    return `/kolekcia/${key}`;
}
