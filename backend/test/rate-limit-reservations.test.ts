// Must precede every import that reaches src/env.ts.
import './real-rate-limits.js';
import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { api, OPEN_DATE, resetData, startTestServer, stopTestServer, type TestContext } from './support.js';

/**
 * Rate limiters keep their counters in memory for the life of the process. Node's
 * test runner gives every file its own process, so these budgets are untouched
 * here and spending them cannot affect any other file.
 */

let context: TestContext;

before(async () => {
    context = await startTestServer();
});
after(stopTestServer);
beforeEach(async () => {
    await resetData();
});

describe('reservation rate limit', () => {
    it('lets eight requests through per hour and throttles the ninth', async () => {
        const available = await api<{ slots: string[] }>(context, 'GET', `/api/availability?date=${OPEN_DATE}`);
        const slots = available.body.slots;
        assert.ok(slots.length > 0);

        const book = (time: string, email: string) =>
            api<{ error?: string }>(context, 'POST', '/api/reservations', {
                body: { name: 'Klientka', phone: '+421900111222', email, cat: 'Svadobné šaty', date: OPEN_DATE, time },
            });

        // Every request counts against the budget whatever it answers, so the
        // assertion is about the budget, not about which ones happened to succeed.
        for (let i = 0; i < 8; i += 1) {
            const response = await book(slots[i % slots.length] as string, `k${i}@example.sk`);
            assert.notEqual(response.status, 429, `request ${i + 1} of 8 must not be throttled`);
        }

        const ninth = await book(slots[0] as string, 'ninth@example.sk');
        assert.equal(ninth.status, 429);
        assert.match(ninth.body.error ?? '', /Príliš veľa žiadostí/);
    });
});

describe('health endpoint', () => {
    it('is exempt from the global limiter so uptime checks never trip it', async () => {
        for (let i = 0; i < 30; i += 1) {
            assert.equal((await api(context, 'GET', '/api/health')).status, 200);
        }
    });
});
