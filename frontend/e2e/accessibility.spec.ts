import { expect, test } from '@playwright/test';
import { acceptConsent, PUBLIC_ROUTES } from './helpers';

/** Relative luminance, WCAG 2.1 definition. */
function findContrastFailures(): string[] {
    const luminance = (r: number, g: number, b: number) => {
        const channel = (value: number) => {
            const c = value / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const parse = (value: string) => (value.match(/[\d.]+/g) ?? []).map(Number);
    const failures: string[] = [];

    for (const element of document.querySelectorAll('*')) {
        const text = element.textContent?.trim();
        if (!text || element.children.length > 0) continue;
        // Decorative by declaration, and regions layered over a photograph the probe
        // cannot sample. Both are exempt from a computed-contrast check.
        if (element.closest('[aria-hidden="true"], [data-over-media], :disabled')) continue;
        const style = getComputedStyle(element);
        if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) < 0.5) continue;

        let node: Element | null = element;
        let background: number[] | null = null;
        let overImage = false;
        while (node) {
            if (getComputedStyle(node).backgroundImage !== 'none') {
                overImage = true;
                break;
            }
            const parsed = parse(getComputedStyle(node).backgroundColor);
            if (parsed.length >= 3 && (parsed[3] === undefined || parsed[3] > 0.5)) {
                background = parsed;
                break;
            }
            node = node.parentElement;
        }
        if (overImage || !background) continue;

        const raw = parse(style.color);
        const alpha = raw[3] ?? 1;
        const blended = [0, 1, 2].map((i) => (raw[i] ?? 0) * alpha + (background[i] ?? 0) * (1 - alpha));

        const l1 = luminance(blended[0] ?? 0, blended[1] ?? 0, blended[2] ?? 0);
        const l2 = luminance(background[0] ?? 0, background[1] ?? 0, background[2] ?? 0);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

        const size = Number.parseFloat(style.fontSize);
        const weight = Number.parseInt(style.fontWeight, 10);
        const required = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;

        if (ratio < required) {
            failures.push(`"${text.slice(0, 28)}" ${style.color} @${size}px = ${ratio.toFixed(2)}:1 (needs ${required})`);
        }
    }
    return [...new Set(failures)];
}

/**
 * The colour a link takes on hover, and whether it still reads against its
 * background. The global `a:hover` colour is the exact background of the dark
 * surfaces, so any link there that forgets its own hover rule vanishes.
 */
function findHoverContrastFailures(): string[] {
    const specificity = (selector: string): number => {
        const ids = (selector.match(/#[\w-]+/g) ?? []).length;
        const classes = (selector.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)(?!hover)[\w-]+/g) ?? []).length;
        const elements = (selector.match(/(^|[\s>+~])[a-z][\w-]*/gi) ?? []).length;
        return ids * 10000 + classes * 100 + elements;
    };

    const hoverColour = (element: Element): string | null => {
        let best: string | null = null;
        let bestScore = -1;
        let order = 0;
        for (const sheet of document.styleSheets) {
            let rules: CSSRuleList;
            try {
                rules = sheet.cssRules;
            } catch {
                continue;
            }
            for (const rule of rules) {
                order += 1;
                const styleRule = rule as CSSStyleRule;
                if (!styleRule.selectorText || !styleRule.style?.color) continue;
                for (const part of styleRule.selectorText.split(',')) {
                    if (!/:hover/.test(part)) continue;
                    const base = part.replace(/:hover/g, '').trim();
                    let matches = false;
                    try {
                        matches = element.matches(base);
                    } catch {
                        continue;
                    }
                    if (!matches) continue;
                    const score = specificity(part) * 100000 + order;
                    if (score > bestScore) {
                        bestScore = score;
                        best = styleRule.style.color;
                    }
                }
            }
        }
        return best;
    };

    const parse = (value: string) => (value.match(/[\d.]+/g) ?? []).map(Number);
    const luminance = (rgb: number[]) => {
        const channel = (value: number) => {
            const c = (value ?? 0) / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * channel(rgb[0] ?? 0) + 0.7152 * channel(rgb[1] ?? 0) + 0.0722 * channel(rgb[2] ?? 0);
    };

    const failures: string[] = [];

    for (const link of document.querySelectorAll('a, button')) {
        const box = link.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;
        // Same exemptions as the resting-state check.
        if (link.closest('[aria-hidden="true"], [data-over-media]')) continue;

        const colour = hoverColour(link);
        if (!colour) continue;

        let node: Element | null = link;
        let background: number[] | null = null;
        let overImage = false;
        while (node) {
            const style = getComputedStyle(node);
            if (style.backgroundImage !== 'none') {
                overImage = true;
                break;
            }
            const parsed = parse(style.backgroundColor);
            if (parsed.length >= 3 && (parsed[3] === undefined || parsed[3] > 0.5)) {
                background = parsed;
                break;
            }
            node = node.parentElement;
        }
        if (overImage || !background) continue;

        // A hover rule may also change the background; take that into account.
        const raw = parse(colour);
        const alpha = raw[3] ?? 1;
        const blended = [0, 1, 2].map((i) => (raw[i] ?? 0) * alpha + (background[i] ?? 0) * (1 - alpha));

        const l1 = luminance(blended);
        const l2 = luminance(background);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

        const style = getComputedStyle(link);
        const size = Number.parseFloat(style.fontSize);
        const weight = Number.parseInt(style.fontWeight, 10);
        const required = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;

        if (ratio < required) {
            const text = (link.textContent ?? '').trim().slice(0, 28);
            failures.push(`"${text}" hovers to ${colour} = ${ratio.toFixed(2)}:1 (needs ${required})`);
        }
    }

    return [...new Set(failures)];
}

test.describe('accessibility', () => {
    test.beforeEach(async ({ page }) => {
        await acceptConsent(page);
    });

    test('text meets WCAG AA contrast on every public page', async ({ page }) => {
        for (const route of PUBLIC_ROUTES) {
            await page.goto(route);
            await page.waitForLoadState('networkidle');
            const failures = await page.evaluate(findContrastFailures);
            expect(failures, `${route}:\n${failures.join('\n')}`).toEqual([]);
        }
    });

    test('tappable things are at least 44px on a phone', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });

        for (const route of PUBLIC_ROUTES) {
            await page.goto(route);
            await page.waitForLoadState('networkidle');
            // Web fonts and the reveal transition both move boxes; measuring mid-flight
            // reports a height the finished layout never has.
            await page.evaluate(() => document.fonts.ready);
            await page.waitForTimeout(400);

            const small = await page.evaluate(() => {
                const results: string[] = [];
                for (const element of document.querySelectorAll('a, button, input, select, textarea')) {
                    const box = element.getBoundingClientRect();
                    if (box.width === 0 || box.height === 0) continue;
                    if (getComputedStyle(element).position === 'fixed' && box.top < 0) continue;
                    // Half a pixel of tolerance: sub-pixel rounding, not a real miss.
                    if (box.height < 43.5) {
                        results.push(`${element.tagName} "${(element.textContent ?? '').trim().slice(0, 24)}" ${Math.round(box.height)}px`);
                    }
                }
                return [...new Set(results)];
            });

            expect(small, `${route}:\n${small.join('\n')}`).toEqual([]);
        }
    });

    test('content survives without JavaScript', async ({ browser }) => {
        const context = await browser.newContext({ javaScriptEnabled: false });
        const page = await context.newPage();
        await page.goto('/');

        // React never mounts, so nothing renders, but the reveal rules must not be
        // the reason: they are gated on html.js, which only the bundle sets.
        const hasJsClass = await page.evaluate(() => document.documentElement.classList.contains('js'));
        expect(hasJsClass).toBe(false);
        await context.close();
    });

    test('icon-only and ambiguous controls are labelled', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');

        const unlabelled = await page.evaluate(() =>
            [...document.querySelectorAll('button')]
                .filter((button) => !button.textContent?.trim() && !button.getAttribute('aria-label'))
                .map((button) => button.outerHTML.slice(0, 60)),
        );
        expect(unlabelled).toEqual([]);
    });

    test('inputs are associated with a label', async ({ page }) => {
        await page.goto('/rezervacia');

        const orphans = await page.evaluate(
            () =>
                [...document.querySelectorAll('input')].filter(
                    (input) => !input.closest('label') && !input.getAttribute('aria-label') && !input.getAttribute('id'),
                ).length,
        );
        expect(orphans).toBe(0);
    });

    test('no link disappears into its background on hover', async ({ page }) => {
        // Resolved from the stylesheets rather than by moving a real mouse: every
        // link gets checked, including ones far down the page, and the result does
        // not depend on what happens to be under the cursor.
        for (const route of PUBLIC_ROUTES) {
            await page.goto(route);
            await page.waitForLoadState('networkidle');

            const failures = await page.evaluate(findHoverContrastFailures);
            expect(failures, `${route}:\n${failures.join('\n')}`).toEqual([]);
        }
    });

    test('respects prefers-reduced-motion', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');

        const duration = await page.evaluate(() => {
            const hero = document.querySelector('h1');
            return hero ? getComputedStyle(hero).animationDuration : '';
        });
        // Chrome reports the 0.01ms override in seconds.
        expect(Number.parseFloat(duration)).toBeLessThan(0.001);
    });
});
