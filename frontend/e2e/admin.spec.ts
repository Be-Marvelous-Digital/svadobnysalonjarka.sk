import { expect, test } from '@playwright/test';
import { acceptConsent } from './helpers';

test.describe('admin', () => {
    test.beforeEach(async ({ page }) => {
        await acceptConsent(page);
    });

    test('is not linked from the public site', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('a[href="/admin"]')).toHaveCount(0);
    });

    test('is kept out of the index', async ({ page }) => {
        await page.goto('/admin');
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    });

    test('rejects wrong credentials without revealing which half was wrong', async ({ page }) => {
        await page.goto('/admin');
        await page.getByLabel('Prihlasovacie meno').fill('admin');
        await page.getByLabel('Heslo').fill('zle-heslo');
        await page.getByRole('button', { name: 'Prihlásiť sa' }).click();

        await expect(page.getByRole('alert')).toHaveText('Nesprávne meno alebo heslo.');

        await page.getByLabel('Prihlasovacie meno').fill('neexistuje');
        await page.getByLabel('Heslo').fill('JarkaAdmin123');
        await page.getByRole('button', { name: 'Prihlásiť sa' }).click();
        await expect(page.getByRole('alert')).toHaveText('Nesprávne meno alebo heslo.');
    });

    test('signs in, shows the tabs, signs out', async ({ page }) => {
        await page.goto('/admin');
        await page.getByLabel('Prihlasovacie meno').fill('admin');
        await page.getByLabel('Heslo').fill('JarkaAdmin123');
        await page.getByRole('button', { name: 'Prihlásiť sa' }).click();

        await expect(page.getByRole('heading', { name: 'Dopyty a galéria' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Dopyty' })).toBeVisible();

        await page.getByRole('button', { name: 'Galéria', exact: true }).click();
        await expect(page.getByText(/prevedú do WebP/)).toBeVisible();

        await page.getByRole('button', { name: 'Odhlásiť sa' }).click();
        await expect(page.getByRole('heading', { name: 'Prihlásenie' })).toBeVisible();
    });

    test('every gallery photo offers replace and delete', async ({ page }) => {
        await page.goto('/admin');
        await page.getByLabel('Prihlasovacie meno').fill('admin');
        await page.getByLabel('Heslo').fill('JarkaAdmin123');
        await page.getByRole('button', { name: 'Prihlásiť sa' }).click();
        await page.getByRole('button', { name: 'Galéria', exact: true }).click();

        await expect(page.getByRole('button', { name: 'Nahradiť' }).first()).toBeVisible();
        await expect(page.getByRole('button', { name: 'Zmazať' }).first()).toBeVisible();
    });

    test('deleting asks first, because the file leaves the volume too', async ({ page }) => {
        await page.goto('/admin');
        await page.getByLabel('Prihlasovacie meno').fill('admin');
        await page.getByLabel('Heslo').fill('JarkaAdmin123');
        await page.getByRole('button', { name: 'Prihlásiť sa' }).click();
        await page.getByRole('button', { name: 'Galéria', exact: true }).click();

        let asked = '';
        page.on('dialog', (dialog) => {
            asked = dialog.message();
            void dialog.dismiss();
        });

        await page.getByRole('button', { name: 'Zmazať' }).first().click();
        expect(asked).toContain('úložiska');
    });
});
