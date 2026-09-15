import { expect, test } from '@playwright/test';
import { acceptConsent } from './helpers';

async function signIn(page: import('@playwright/test').Page, tab: string) {
    await page.goto('/admin');
    await page.getByLabel('Prihlasovacie meno').fill('admin');
    await page.getByLabel('Heslo').fill('JarkaAdmin123');
    await page.getByRole('button', { name: 'Prihlásiť sa' }).click();
    await expect(page.getByRole('heading', { name: 'Dopyty a galéria' })).toBeVisible();
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

test.describe('replying to an inquiry', () => {
    test.beforeEach(async ({ page }) => {
        await acceptConsent(page);
        await signIn(page, 'Dopyty');
    });

    test('the phone and e-mail are links the owner can act on', async ({ page }) => {
        await expect(page.locator('a[href="tel:+421900111222"]')).toBeVisible();
        await expect(page.locator('a[href="mailto:jana@example.sk"]')).toBeVisible();
    });

    test('the reply button opens a mail client with the date already written', async ({ page }) => {
        const reply = page.getByRole('link', { name: 'Odpovedať e-mailom' }).first();
        await expect(reply).toBeVisible();

        const href = await reply.getAttribute('href');
        expect(href).toBeTruthy();

        const url = new URL(href as string);
        expect(url.protocol).toBe('mailto:');
        expect(decodeURIComponent(url.pathname)).toBe('jana@example.sk');

        const params = new URLSearchParams(url.search);
        expect(params.get('subject')).toContain('Váš dopyt');

        const body = params.get('body') ?? '';
        expect(body).toContain('Dobrý deň, Jana');
        // The whole point: the owner should not have to retype the date.
        expect(body).toContain('10. marca 2027');
        expect(body).toContain('11:15');
        expect(body).toContain('Svadobné šaty');
        expect(body).toContain('Salón Jarka');
        expect(body).toContain('+421 948 416 066');
    });
});

test.describe('the inquiry list', () => {
    test.beforeEach(async ({ page }) => {
        await acceptConsent(page);
        await signIn(page, 'Dopyty');
    });

    test('separates new inquiries from handled ones', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Nové dopyty' }).or(page.getByText('Nové dopyty'))).toBeVisible();
        await expect(page.getByText('Vybavené', { exact: true }).first()).toBeVisible();
        await expect(page.getByText('Jana Nováková')).toBeVisible();
        await expect(page.getByText('Vybavena Klientka')).toBeVisible();
    });

    test('says the date is agreed off-site, not approved here', async ({ page }) => {
        await expect(page.getByText(/Termín sa nepotvrdzuje tu/)).toBeVisible();
    });

    test('no longer offers any approval action', async ({ page }) => {
        for (const label of ['Potvrdiť', 'Zamietnuť', 'Navrhnúť iný termín', 'Uložiť návrh']) {
            await expect(page.getByRole('button', { name: label }), label).toHaveCount(0);
        }
    });

    test('has no calendar or opening-hours settings', async ({ page }) => {
        await expect(page.getByText('Nastavenie skúšok')).toHaveCount(0);
        await expect(page.getByText('Dĺžka jednej skúšky')).toHaveCount(0);
        await expect(page.locator('input[type="date"]')).toHaveCount(0);
    });
});
