import { expect, test } from '@playwright/test';
import { acceptConsent, expectNoHorizontalOverflow, PUBLIC_ROUTES } from './helpers';

const WIDTHS = [320, 375, 414, 768, 1024, 1440];

test.describe('responsive layout', () => {
    test.beforeEach(async ({ page }) => {
        await acceptConsent(page);
    });

    for (const width of WIDTHS) {
        test(`no horizontal clipping at ${width}px`, async ({ page }) => {
            await page.setViewportSize({ width, height: 900 });
            for (const route of PUBLIC_ROUTES) {
                await page.goto(route);
                await page.waitForLoadState('networkidle');
                await expectNoHorizontalOverflow(page);
            }
        });
    }

    test('form fields are at least 16px so iOS Safari does not zoom', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/rezervacia');

        const sizes = await page.evaluate(() =>
            [...document.querySelectorAll('input, select, textarea')].map((element) =>
                Number.parseFloat(getComputedStyle(element).fontSize),
            ),
        );

        expect(sizes.length).toBeGreaterThan(0);
        for (const size of sizes) expect(size).toBeGreaterThanOrEqual(16);
    });

    test('the sticky bars do not cover the footer', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        const bar = page.locator('a', { hasText: 'Objednať skúšku' }).last();
        await expect(bar).toBeVisible();

        const overlap = await page.evaluate(() => {
            const link = [...document.querySelectorAll('footer a')].pop();
            const spacerHeight = document.querySelector('footer')?.getBoundingClientRect().bottom ?? 0;
            return { hasLink: !!link, footerBottom: spacerHeight };
        });
        expect(overlap.hasLink).toBe(true);
    });
});
