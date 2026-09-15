import { expect, test } from '@playwright/test';
import { acceptConsent } from './helpers';

async function signIn(page: import('@playwright/test').Page, tab: string) {
    await page.goto('/admin');
    await page.getByLabel('Prihlasovacie meno').fill('admin');
    await page.getByLabel('Heslo').fill('JarkaAdmin123');
    await page.getByRole('button', { name: 'Prihlásiť sa' }).click();
    await expect(page.getByRole('heading', { name: 'Galéria a rezervácie' })).toBeVisible();
    await page.getByRole('button', { name: tab, exact: true }).click();
}

test.describe('gallery ordering', () => {
    test.beforeEach(async ({ page }) => {
        await acceptConsent(page);
        await signIn(page, 'Galéria');
    });

    test('offers the instagram category so the home page strip is editable', async ({ page }) => {
        await expect(page.getByRole('button', { name: /Instagram na úvodnej stránke/ })).toBeVisible();
    });

    test('numbers every photo and says how to reorder', async ({ page }) => {
        await expect(page.getByText('01 / 05')).toBeVisible();
        await expect(page.getByText(/Poradie zmeníte potiahnutím alebo šípkami/)).toBeVisible();
    });

    test('the arrows move a photo and persist the new order', async ({ page }) => {
        const firstImage = page.locator('img[alt="Fotografia 1"]');
        const before = await firstImage.getAttribute('src');
        assertDefined(before);

        // The second photo's "move earlier" button swaps it with the first.
        await page.getByRole('button', { name: 'Posunúť fotografiu 2 dopredu' }).click();
        await expect(page.locator('img[alt="Fotografia 1"]')).not.toHaveAttribute('src', before);

        await page.reload();
        await page.getByRole('button', { name: 'Galéria', exact: true }).click();
        await expect(page.locator('img[alt="Fotografia 1"]')).not.toHaveAttribute('src', before);
    });

    test('the first photo cannot move earlier and the last cannot move later', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Posunúť fotografiu 1 dopredu' })).toBeDisabled();
        await expect(page.getByRole('button', { name: 'Posunúť fotografiu 5 dozadu' })).toBeDisabled();
    });

    test('every tile is draggable', async ({ page }) => {
        const tiles = page.locator('[draggable="true"]');
        await expect(tiles.first()).toBeVisible();
        expect(await tiles.count()).toBeGreaterThan(1);
    });
});

function assertDefined(value: string | null): asserts value is string {
    expect(value).not.toBeNull();
}

test.describe('user management', () => {
    test.beforeEach(async ({ page }) => {
        await acceptConsent(page);
        await signIn(page, 'Používatelia');
    });

    test('lists the accounts and marks the signed-in one', async ({ page }) => {
        // The badge lives inside the name, so the row text reads "adminvy".
        await expect(page.getByText(/^admin/).first()).toBeVisible();
        await expect(page.getByText('vy', { exact: true }).first()).toBeVisible();
        await expect(page.getByText(/Vytvorený/).first()).toBeVisible();
    });

    test('never renders a password hash', async ({ page }) => {
        expect(await page.content()).not.toContain('$2b$');
    });

    test('creates an account', async ({ page }) => {
        // Both projects run against one mock, so the name has to be unique per
        // project or the second run collides with the first.
        const username = `nova${test.info().project.name}`;

        await page.getByLabel('Prihlasovacie meno').fill(username);
        await page.getByLabel('Heslo', { exact: true }).first().fill('NoveHeslo123');
        await page.getByRole('button', { name: 'Vytvoriť účet' }).click();

        await expect(page.getByRole('status')).toContainText(username);
    });

    test('keeps the create button disabled until the password is long enough', async ({ page }) => {
        const submit = page.getByRole('button', { name: 'Vytvoriť účet' });
        await expect(submit).toBeDisabled();

        await page.getByLabel('Prihlasovacie meno').fill('kratke');
        await page.getByLabel('Heslo', { exact: true }).first().fill('Kratke1');
        await expect(submit).toBeDisabled();

        await page.getByLabel('Heslo', { exact: true }).first().fill('DostDlhe123');
        await expect(submit).toBeEnabled();
    });

    test('reports a wrong current password when changing your own', async ({ page }) => {
        await page.getByLabel('Súčasné heslo').fill('nespravne');
        await page.getByLabel('Nové heslo').fill('NoveHeslo123');
        await page.getByRole('button', { name: 'Zmeniť heslo' }).click();

        await expect(page.getByRole('status')).toContainText('Súčasné heslo nesedí');
    });

    test('offers a password reset for a colleague but not for yourself', async ({ page }) => {
        // Other tests in this file add accounts against the shared mock, so the
        // count is not fixed; what matters is that the option exists for someone
        // else and never for the signed-in row.
        await expect(page.getByRole('button', { name: 'Nastaviť heslo' }).first()).toBeVisible();
        await expect(page.getByText('Svoje heslo zmeníte nižšie')).toBeVisible();
    });

    test('asks before deleting an account', async ({ page }) => {
        let asked = '';
        page.on('dialog', (dialog) => {
            asked = dialog.message();
            void dialog.dismiss();
        });

        await page.getByRole('button', { name: 'Zmazať' }).first().click();
        expect(asked).toContain('Stratí prístup');
    });
});
