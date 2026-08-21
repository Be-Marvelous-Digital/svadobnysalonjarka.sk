import { expect, type Page } from '@playwright/test';

export const PUBLIC_ROUTES = [
    '/',
    '/kolekcia/svadobne',
    '/kolekcia/galeria',
    '/ceny',
    '/o-salone',
    '/kontakt',
    '/rezervacia',
    '/ochrana-sukromia',
    '/zasady-pouzivania',
];

/** Dismisses the consent bar so it cannot sit on top of what a test wants to click. */
export async function acceptConsent(page: Page): Promise<void> {
    await page.addInitScript(() => {
        window.localStorage.setItem(
            'jarka_consent',
            JSON.stringify({ embeds: true, version: 1, decidedAt: '2026-01-01T00:00:00.000Z' }),
        );
    });
}

export async function rejectConsent(page: Page): Promise<void> {
    await page.addInitScript(() => {
        window.localStorage.setItem(
            'jarka_consent',
            JSON.stringify({ embeds: false, version: 1, decidedAt: '2026-01-01T00:00:00.000Z' }),
        );
    });
}

/**
 * `body { overflow-x: hidden }` hides a sideways scrollbar, so comparing
 * scrollWidth to clientWidth is the only way to catch clipped content.
 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
    const { scrollWidth, clientWidth, offenders } = await page.evaluate(() => {
        const doc = document.documentElement;
        const viewport = doc.clientWidth;
        const offenders: string[] = [];
        for (const element of document.querySelectorAll('*')) {
            const box = element.getBoundingClientRect();
            if (box.width > 0 && box.right > viewport + 1) {
                offenders.push(`${element.tagName}.${String(element.className).split(' ')[0]}`);
            }
        }
        return { scrollWidth: doc.scrollWidth, clientWidth: viewport, offenders: [...new Set(offenders)].slice(0, 6) };
    });

    expect(scrollWidth, `overflowing: ${offenders.join(', ')}`).toBeLessThanOrEqual(clientWidth);
}

/**
 * The mock API keeps reservations in memory and the suite runs in parallel, so
 * every test that books has to own its own date or workers eat each other's slots.
 */
export function bookableDate(seed: number, project = 'desktop'): string {
    const month = project === 'mobile' ? '04' : '03';
    return `2027-${month}-${String(seed + 1).padStart(2, '0')}`;
}

export const FULLY_BOOKED_DATE = '2027-01-04';
