import { expect, test } from '@playwright/test';
import { acceptConsent, PUBLIC_ROUTES } from './helpers';

/**
 * The scroll-reveal sections start hidden and are uncovered by an IntersectionObserver.
 * A specificity slip in that CSS leaves whole pages blank while every other check
 * still passes, so visibility gets its own assertions.
 */

const HOME_SECTIONS = [
    'Čo u nás nájdete',
    'Od roku 2007 v Galante',
    'Oblek, ktorý stojí vedľa šiat',
    'Tri kroky k vašim šatám',
    'Slová, ktoré nás tešia',
    'Zajednajte si termín skúšky',
];

async function scrollThrough(page: import('@playwright/test').Page): Promise<void> {
    await page.evaluate(async () => {
        const step = window.innerHeight / 2;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 60));
        }
        window.scrollTo(0, 0);
    });
}

test.describe('page content is actually visible', () => {
    test.beforeEach(async ({ page }) => {
        await acceptConsent(page);
    });

    test('no reveal section is left hidden on any public page', async ({ page }) => {
        for (const route of PUBLIC_ROUTES) {
            await page.goto(route);
            await page.waitForLoadState('networkidle');
            await scrollThrough(page);

            // The reveal transition runs for 1.1s, so poll rather than guess a wait.
            await expect
                .poll(
                    () =>
                        page.evaluate(() =>
                            [...document.querySelectorAll('section, article, div')]
                                .filter((element) => {
                                    const box = element.getBoundingClientRect();
                                    if (box.width === 0 || box.height < 40) return false;
                                    return Number(getComputedStyle(element).opacity) < 0.9;
                                })
                                .map((element) => `${element.tagName}.${String(element.className).split(' ')[0]}`),
                        ),
                    { message: `${route} has invisible content` },
                )
                .toEqual([]);
        }
    });

    test('the home page has no blank stretch between the hero and the footer', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await scrollThrough(page);

        for (const heading of HOME_SECTIONS) {
            await expect(page.getByText(heading, { exact: false }).first(), heading).toBeVisible();
        }

        // Everything between the hero and the footer must render something. Polled,
        // because the reveal transition runs for 1.1s after a section scrolls in.
        const measureGap = () =>
            page.evaluate(() => {
                const main = document.querySelector('main');
                const hero = main?.querySelector('section');
                const footer = document.querySelector('footer');
                if (!main || !hero || !footer) return { gap: -1 };

                const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
                const footerTop = footer.getBoundingClientRect().top + window.scrollY;

                // opacity is not inherited as a computed value, so a child of a faded
                // section still reports 1. The ancestors have to be multiplied in.
                const effectiveOpacity = (element: Element): number => {
                    let value = 1;
                    let node: Element | null = element;
                    while (node && node !== document.documentElement) {
                        value *= Number(getComputedStyle(node).opacity);
                        node = node.parentElement;
                    }
                    return value;
                };

                // Tallest vertical run with nothing visible in it.
                const boxes = [...main.querySelectorAll('*')]
                    .filter((element) => effectiveOpacity(element) > 0.9)
                    .map((element) => {
                        const box = element.getBoundingClientRect();
                        return { top: box.top + window.scrollY, bottom: box.bottom + window.scrollY };
                    })
                    .filter((box) => box.bottom > heroBottom && box.top < footerTop)
                    .sort((a, b) => a.top - b.top);

                let gap = 0;
                let reach = heroBottom;
                for (const box of boxes) {
                    if (box.top > reach) gap = Math.max(gap, box.top - reach);
                    reach = Math.max(reach, box.bottom);
                }
                gap = Math.max(gap, footerTop - reach);
                return gap;
            });

        await expect
            .poll(measureGap, { message: 'blank vertical run between hero and footer' })
            .toBeLessThan(400);
    });
});

test.describe('home page Instagram strip', () => {
    test('renders the photos the admin manages, not a hard-coded list', async ({ page }) => {
        await acceptConsent(page);
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const sources = await page.evaluate(() => {
            const heading = [...document.querySelectorAll('h2')].find((node) =>
                node.textContent?.includes('@svadobnysalonjarka'),
            );
            const section = heading?.closest('section');
            return [...(section?.querySelectorAll('img') ?? [])].map((image) => new URL(image.src).pathname);
        });

        // The mock serves three photos for the instagram category; the six-tile
        // fallback would mean the section is ignoring the gallery.
        expect(sources).toEqual(['/assets/svadobne-3.webp', '/assets/spolocenske-2.webp', '/assets/svadobne-4.webp']);
    });

    test('falls back to bundled photos when the category is empty', async ({ page }) => {
        await acceptConsent(page);
        await page.route('**/api/gallery', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    svadobne: [],
                    spolocenske: [],
                    prijimacie: [],
                    zenich: [],
                    obuv: [],
                    galeria: [],
                    instagram: [],
                }),
            }),
        );
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const count = await page.evaluate(() => {
            const heading = [...document.querySelectorAll('h2')].find((node) =>
                node.textContent?.includes('@svadobnysalonjarka'),
            );
            return heading?.closest('section')?.querySelectorAll('img').length ?? 0;
        });
        expect(count).toBe(6);
    });
});
