import { expect, test } from '@playwright/test';
import { acceptConsent } from './helpers';

test.describe('gallery lightbox', () => {
    test.beforeEach(async ({ page }) => {
        await acceptConsent(page);
        await page.goto('/kolekcia/svadobne');
        await page.waitForLoadState('networkidle');
    });

    test('opens on a thumbnail and reports its position', async ({ page }) => {
        await page.getByRole('button', { name: /Zväčšiť Svadobné šaty 1/ }).click();

        const lightbox = page.getByRole('dialog', { name: /Svadobné šaty — fotografia 1 z 5/ });
        await expect(lightbox).toBeVisible();
        await expect(lightbox.getByText('Svadobné šaty · 1 / 5')).toBeVisible();
    });

    test('arrow keys page through and wrap around', async ({ page }) => {
        test.skip(test.info().project.name === 'mobile', 'no keyboard on a touch profile');
        await page.getByRole('button', { name: /Zväčšiť Svadobné šaty 1/ }).click();

        await page.keyboard.press('ArrowRight');
        await expect(page.getByText('Svadobné šaty · 2 / 5')).toBeVisible();

        await page.keyboard.press('ArrowLeft');
        await page.keyboard.press('ArrowLeft');
        await expect(page.getByText('Svadobné šaty · 5 / 5')).toBeVisible();
    });

    test('Escape closes it and focus returns to the thumbnail', async ({ page }) => {
        test.skip(test.info().project.name === 'mobile', 'no keyboard on a touch profile');
        const thumbnail = page.getByRole('button', { name: /Zväčšiť Svadobné šaty 1/ });
        await thumbnail.click();
        await expect(page.getByRole('dialog')).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toBeHidden();
        await expect(thumbnail).toBeFocused();
    });

    test('clicking the backdrop closes it, clicking the photo does not', async ({ page }) => {
        await page.getByRole('button', { name: /Zväčšiť Svadobné šaty 1/ }).click();
        const lightbox = page.getByRole('dialog');

        await lightbox.locator('img').click();
        await expect(lightbox).toBeVisible();

        await lightbox.click({ position: { x: 5, y: 5 } });
        await expect(lightbox).toBeHidden();
    });

    test('a category with no photos explains itself instead of showing an empty grid', async ({ page }) => {
        await page.route('**/api/gallery', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ svadobne: [], spolocenske: [], prijimacie: [], zenich: [], obuv: [], galeria: [] }),
            }),
        );
        await page.goto('/kolekcia/svadobne');

        await expect(page.getByText('fotografie pripravujeme').first()).toBeVisible();
        await expect(page.getByRole('link', { name: 'Objednať skúšku' }).first()).toBeVisible();
    });
});
