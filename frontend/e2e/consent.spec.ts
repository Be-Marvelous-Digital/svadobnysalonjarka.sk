import { expect, test } from '@playwright/test';

const MAP_FRAME = 'iframe[src*="maps.google.com"]';

test.describe('cookie consent', () => {
    test('loads nothing from Google before the visitor agrees', async ({ page }) => {
        const googleRequests: string[] = [];
        page.on('request', (request) => {
            if (request.url().includes('google.com')) googleRequests.push(request.url());
        });

        await page.goto('/kontakt');
        await page.waitForLoadState('networkidle');

        await expect(page.locator(MAP_FRAME)).toHaveCount(0);
        expect(googleRequests, 'no third-party request may precede consent').toEqual([]);
        await expect(page.getByRole('dialog', { name: 'Súkromie na tejto stránke' })).toBeVisible();
    });

    test('refusing is one click, same as accepting', async ({ page }) => {
        await page.goto('/');
        const bar = page.getByRole('dialog', { name: 'Súkromie na tejto stránke' });

        const reject = bar.getByRole('button', { name: 'Odmietnuť' });
        const accept = bar.getByRole('button', { name: 'Povoliť mapu' });
        await expect(reject).toBeVisible();
        await expect(accept).toBeVisible();

        // Equal prominence is the GDPR requirement, not a stylistic preference.
        const rejectBox = await reject.boundingBox();
        const acceptBox = await accept.boundingBox();
        expect(rejectBox?.height).toBeCloseTo(acceptBox?.height ?? 0, 0);

        await reject.click();
        await expect(bar).toBeHidden();
    });

    test('accepting loads the map, withdrawing removes it again', async ({ page }) => {
        await page.goto('/kontakt');
        await page.getByRole('button', { name: 'Povoliť mapu' }).click();
        await expect(page.locator(MAP_FRAME)).toHaveCount(1);

        await page.getByRole('button', { name: 'Nastavenia súkromia' }).click();
        await expect(page.locator(MAP_FRAME)).toHaveCount(0);
        await expect(page.getByRole('dialog', { name: 'Súkromie na tejto stránke' })).toBeVisible();
    });

    test('the decision survives a reload', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Odmietnuť' }).click();

        await page.reload();
        await expect(page.getByRole('dialog', { name: 'Súkromie na tejto stránke' })).toBeHidden();
    });

    test('the contact page still gives directions without consent', async ({ page }) => {
        await page.goto('/kontakt');
        await expect(page.getByRole('link', { name: /Otvoriť v Google Mapách/ })).toBeVisible();
        await expect(page.getByText('Vajanského 1521').first()).toBeVisible();
    });
});
