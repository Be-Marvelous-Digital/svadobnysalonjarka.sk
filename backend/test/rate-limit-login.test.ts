// Must precede every import that reaches src/env.ts.
import './real-rate-limits.js';
import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { api, createAdmin, resetData, resetUsers, startTestServer, stopTestServer, type TestContext } from './support.js';

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
    await resetUsers();
    await createAdmin();
});

describe('login rate limit', () => {
    it('locks out after ten wrong attempts and stays locked for a correct one', async () => {
        const attempt = () =>
            api<{ error: string }>(context, 'POST', '/api/admin/login', {
                body: { username: 'admin', password: 'nespravne' },
            });

        for (let i = 0; i < 10; i += 1) {
            assert.equal((await attempt()).status, 401, `attempt ${i + 1} should still be answered normally`);
        }

        const blocked = await attempt();
        assert.equal(blocked.status, 429);
        assert.match(blocked.body.error, /Príliš veľa pokusov/);

        // The lockout is on the endpoint, not on the guess: the right password is
        // refused too, which is what stops a slow brute force.
        const correct = await api(context, 'POST', '/api/admin/login', {
            body: { username: 'admin', password: 'JarkaAdmin123' },
        });
        assert.equal(correct.status, 429);
    });
});
