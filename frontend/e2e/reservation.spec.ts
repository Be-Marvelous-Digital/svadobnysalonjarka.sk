import { expect, test } from '@playwright/test';
import { acceptConsent, bookableDate, FULLY_BOOKED_DATE } from './helpers';

test.describe('reservation flow', () => {
    const dateFor = (seed: number, project: string) => bookableDate(seed, project);

    test.beforeEach(async ({ page }) => {
        await acceptConsent(page);
        await page.goto('/rezervacia');
    });

    async function completeSchedule(page: import('@playwright/test').Page, date: string, time = '11:15') {
        await page.getByRole('button', { name: 'Svadobné šaty' }).click();
        await page.locator('input[type="date"]').fill(date);
        await page.getByRole('button', { name: time }).click();
        await page.getByRole('button', { name: 'Pokračovať' }).click();
    }

    async function completeContact(page: import('@playwright/test').Page) {
        await page.getByLabel('Meno a priezvisko').fill('Jana Nováková');
        await page.getByLabel('Telefón').fill('+421 900 111 222');
        await page.getByLabel('E-mail').fill('jana@example.sk');
        await page.getByRole('button', { name: 'Skontrolovať' }).click();
    }

    test('books a fitting end to end', async ({ page }) => {
        await completeSchedule(page, dateFor(1, test.info().project.name));
        await expect(page.getByLabel('Meno a priezvisko')).toBeVisible();

        await completeContact(page);
        await expect(page.getByText('Jana Nováková')).toBeVisible();
        await expect(page.getByText('+421 900 111 222 · jana@example.sk')).toBeVisible();

        await page.getByRole('button', { name: 'Odoslať dopyt' }).click();

        await expect(page.getByRole('heading', { name: 'Žiadosť sme prijali' })).toBeVisible();
        await expect(page.getByText(/Ďakujeme, Jana/)).toBeVisible();
        // The salon confirms by phone; the page must not imply the slot is locked in.
        await expect(page.getByText(/Termín ešte nie je potvrdený/)).toBeVisible();
    });

    test('blocks step one until type, date and time are all chosen', async ({ page }) => {
        const next = page.getByRole('button', { name: 'Pokračovať' });
        await expect(next).toBeDisabled();

        await page.locator('input[type="date"]').fill(dateFor(2, test.info().project.name));
        await expect(next).toBeDisabled();

        await page.getByRole('button', { name: '10:00' }).click();
        await expect(next).toBeEnabled();
    });

    test('rejects a malformed e-mail before the review step', async ({ page }) => {
        await completeSchedule(page, dateFor(3, test.info().project.name));
        await page.getByLabel('Meno a priezvisko').fill('Jana Nováková');
        await page.getByLabel('Telefón').fill('+421 900 111 222');
        await page.getByLabel('E-mail').fill('nie-je-email');

        await expect(page.getByRole('button', { name: 'Skontrolovať' })).toBeDisabled();
    });

    test('says so when a day has no free slot', async ({ page }) => {
        await page.locator('input[type="date"]').fill(FULLY_BOOKED_DATE);
        await expect(page.getByText('V tento deň nemáme voľný termín, vyberte, prosím, iný deň.')).toBeVisible();
    });

    test('announces a conflict and sends the visitor back to pick another time', async ({ page, request }) => {
        const date = dateFor(4, test.info().project.name);
        await completeSchedule(page, date);

        // Someone else takes the slot while this visitor is still filling in their details.
        await request.post('/api/reservations', {
            data: { name: 'Iná', phone: '+421900000000', email: 'x@y.sk', cat: 'Svadobné šaty', date, time: '11:15' },
        });

        await completeContact(page);
        await page.getByRole('button', { name: 'Odoslať dopyt' }).click();

        const alert = page.getByRole('alert');
        await expect(alert).toContainText('už obsadený');
        await expect(page.locator('input[type="date"]')).toBeVisible();
    });

    test('Enter advances the step, so the form behaves like a form', async ({ page }) => {
        await page.getByRole('button', { name: 'Svadobné šaty' }).click();
        await page.locator('input[type="date"]').fill(dateFor(5, test.info().project.name));
        await page.getByRole('button', { name: '12:30' }).click();

        await page.locator('input[type="date"]').press('Enter');
        await expect(page.getByLabel('Meno a priezvisko')).toBeVisible();
    });

    test('Späť keeps what was already filled in', async ({ page }) => {
        const date = dateFor(6, test.info().project.name);
        await completeSchedule(page, date);
        await page.getByLabel('Meno a priezvisko').fill('Jana Nováková');
        await page.getByRole('button', { name: 'Späť' }).click();

        await expect(page.locator('input[type="date"]')).toHaveValue(date);
        await page.getByRole('button', { name: 'Pokračovať' }).click();
        await expect(page.getByLabel('Meno a priezvisko')).toHaveValue('Jana Nováková');
    });

    test('the step indicator names the current step for screen readers', async ({ page }) => {
        await expect(page.getByRole('list', { name: /Krok 1 z 3: Termín/ })).toBeVisible();
        await completeSchedule(page, dateFor(7, test.info().project.name));
        await expect(page.getByRole('list', { name: /Krok 2 z 3: Kontakt/ })).toBeVisible();
    });
});
