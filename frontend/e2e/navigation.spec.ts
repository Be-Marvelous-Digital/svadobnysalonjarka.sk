import { expect, test } from '@playwright/test';
import { acceptConsent } from './helpers';

test.describe('navigation', () => {
    test.beforeEach(async ({ page }) => {
        await acceptConsent(page);
    });

    test('reaches every collection from the home grid', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: /Spoločenské šaty/ }).first().click();
        await expect(page).toHaveURL('/kolekcia/spolocenske');
        await expect(page.getByRole('heading', { level: 1, name: 'Spoločenské šaty' })).toBeVisible();
    });

    test('an unknown route falls back to the home page', async ({ page }) => {
        await page.goto('/toto-neexistuje');
        await expect(page).toHaveURL('/');
    });

    test('a new route starts at the top of the page', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => window.scrollTo(0, 2000));
        await page.getByRole('contentinfo').getByRole('link', { name: 'Ceny' }).click();
        await expect(page).toHaveURL('/ceny');
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    });

    test('the skip link is reachable by keyboard and jumps to the content', async ({ page }) => {
        test.skip(test.info().project.name === 'mobile', 'no keyboard on a touch profile');
        await page.goto('/');
        await page.keyboard.press('Tab');

        const skip = page.getByRole('link', { name: 'Preskočiť na obsah' });
        await expect(skip).toBeFocused();
        await skip.press('Enter');
        await expect(page).toHaveURL(/#obsah$/);
    });
});

test.describe('mobile drawer', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test.beforeEach(async ({ page }) => {
        await acceptConsent(page);
        await page.goto('/');
    });

    test('opens, navigates and closes', async ({ page }) => {
        const burger = page.getByRole('button', { name: 'Otvoriť menu' });
        await expect(burger).toHaveAttribute('aria-expanded', 'false');

        await burger.click();
        const drawer = page.getByRole('dialog', { name: 'Menu' });
        await expect(drawer).toBeVisible();
        await expect(burger).toHaveAttribute('aria-expanded', 'true');

        await drawer.getByRole('link', { name: 'Kontakt' }).click();
        await expect(page).toHaveURL('/kontakt');
        await expect(drawer).toBeHidden();
    });

    test('Escape closes it and focus returns to the burger', async ({ page }) => {
        test.skip(test.info().project.name === 'mobile', 'no keyboard on a touch profile');
        const burger = page.getByRole('button', { name: 'Otvoriť menu' });
        await burger.click();
        await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden();
        await expect(burger).toBeFocused();
    });

    test('locks the page behind it', async ({ page }) => {
        await page.getByRole('button', { name: 'Otvoriť menu' }).click();
        expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');

        await page.keyboard.press('Escape');
        expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    });

    test('keeps Tab inside the drawer', async ({ page }) => {
        test.skip(test.info().project.name === 'mobile', 'no keyboard on a touch profile');
        await page.getByRole('button', { name: 'Otvoriť menu' }).click();
        const drawer = page.getByRole('dialog', { name: 'Menu' });

        for (let press = 0; press < 25; press += 1) await page.keyboard.press('Tab');

        const focusInsideDrawer = await drawer.evaluate((node) => node.contains(document.activeElement));
        expect(focusInsideDrawer).toBe(true);
    });
});
