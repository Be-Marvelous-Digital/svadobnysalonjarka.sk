import { expect, test } from '@playwright/test';
import { acceptConsent, PUBLIC_ROUTES } from './helpers';

const ORIGIN = 'https://svadobnysalonjarka.sk';

async function meta(page: import('@playwright/test').Page, selector: string, attribute = 'content') {
    return page.locator(selector).first().getAttribute(attribute);
}

test.describe('SEO', () => {
    test.beforeEach(async ({ page }) => {
        await acceptConsent(page);
    });

    test('every public page has a unique title, description and canonical', async ({ page }) => {
        const titles = new Set<string>();
        const descriptions = new Set<string>();

        for (const route of PUBLIC_ROUTES) {
            await page.goto(route);
            // usePageMeta writes on mount, so the shell's default title is what a
            // fast read returns.
            await expect.poll(() => page.title()).not.toBe('');
            await expect.poll(() => page.locator('link[rel="canonical"]').getAttribute('href')).toBe(`${ORIGIN}${route}`);

            const title = await page.title();
            expect(title.length, `${route} title`).toBeGreaterThan(20);
            expect(title.length, `${route} title too long for the SERP`).toBeLessThanOrEqual(70);
            titles.add(title);

            const description = (await meta(page, 'meta[name="description"]')) ?? '';
            expect(description.length, `${route} description`).toBeGreaterThan(70);
            expect(description.length, `${route} description too long`).toBeLessThanOrEqual(200);
            descriptions.add(description);

            expect(await meta(page, 'meta[name="robots"]')).toBe('index, follow');
        }

        expect(titles.size, 'duplicate titles').toBe(PUBLIC_ROUTES.length);
        expect(descriptions.size, 'duplicate descriptions').toBe(PUBLIC_ROUTES.length);
    });

    test('social cards carry an absolute image', async ({ page }) => {
        await page.goto('/kolekcia/svadobne');

        expect(await meta(page, 'meta[property="og:title"]')).toContain('Svadobné šaty');
        expect(await meta(page, 'meta[property="og:url"]')).toBe(`${ORIGIN}/kolekcia/svadobne`);
        expect(await meta(page, 'meta[property="og:image"]')).toMatch(/^https:\/\//);
        expect(await meta(page, 'meta[name="twitter:card"]')).toBe('summary_large_image');
    });

    test('exactly one h1 per page', async ({ page }) => {
        for (const route of PUBLIC_ROUTES) {
            await page.goto(route);
            await expect(page.locator('h1'), route).toHaveCount(1);
        }
    });

    test('publishes a valid LocalBusiness record', async ({ page }) => {
        await page.goto('/');
        const raw = await page.locator('script#schema-salon').textContent();
        const schema = JSON.parse(raw ?? '{}');

        expect(schema['@type']).toBe('ClothingStore');
        expect(schema.address.streetAddress).toBe('Vajanského 1521');
        expect(schema.address.addressLocality).toBe('Galanta');
        expect(schema.telephone).toBe('+421 948 416 066');
        // Six open days: Monday to Saturday, Sunday closed.
        expect(schema.openingHoursSpecification).toHaveLength(6);
        expect(schema.openingHoursSpecification[0].opens).toBe('10:00');
        expect(schema.sameAs.length).toBe(2);
    });

    test('collection pages carry breadcrumbs', async ({ page }) => {
        await page.goto('/kolekcia/zenich');
        const schema = JSON.parse((await page.locator('script#schema-breadcrumb').textContent()) ?? '{}');

        expect(schema['@type']).toBe('BreadcrumbList');
        expect(schema.itemListElement).toHaveLength(2);
        expect(schema.itemListElement[1].name).toBe('Pre ženíchov');
    });

    test('leaves no other page schema behind after navigating', async ({ page }) => {
        await page.goto('/kolekcia/svadobne');
        await expect(page.locator('script#schema-collection')).toHaveCount(1);

        await page.goto('/ceny');
        await expect(page.locator('script#schema-collection')).toHaveCount(0);
    });

    test('robots.txt and sitemap.xml agree on what is public', async ({ request }) => {
        const robots = await (await request.get('/robots.txt')).text();
        expect(robots).toContain('Disallow: /admin');
        expect(robots).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);

        const sitemap = await (await request.get('/sitemap.xml')).text();
        for (const route of PUBLIC_ROUTES) {
            expect(sitemap, `${route} missing from sitemap`).toContain(`<loc>${ORIGIN}${route}</loc>`);
        }
        expect(sitemap).not.toContain('/admin');
    });

    test('images that carry meaning have alt text', async ({ page }) => {
        await page.goto('/kolekcia/svadobne');
        await page.waitForLoadState('networkidle');

        const missing = await page.evaluate(
            () => [...document.querySelectorAll('img')].filter((img) => !img.getAttribute('alt')).length,
        );
        expect(missing).toBe(0);
    });

    test('the page declares Slovak', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('html')).toHaveAttribute('lang', 'sk');
    });
});
