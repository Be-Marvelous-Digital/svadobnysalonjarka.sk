import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import {
    api,
    createAdmin,
    loginAsAdmin,
    resetData,
    resetUsers,
    startTestServer,
    stopTestServer,
    type TestContext,
} from './support.js';

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

const PROTECTED = [
    ['GET', '/api/admin/me'],
    ['GET', '/api/admin/photos'],
    ['GET', '/api/admin/reservations'],
    ['GET', '/api/admin/settings'],
    ['GET', '/api/admin/day?date=2027-03-10'],
    ['POST', '/api/admin/reservations'],
    ['PUT', '/api/admin/settings'],
    ['DELETE', '/api/admin/reservations/000000000000000000000000'],
    ['DELETE', '/api/admin/photos/000000000000000000000000'],
] as const;

describe('admin authentication', () => {
    it('signs in with the seeded credentials and returns an httpOnly cookie', async () => {
        const response = await api<{ ok: boolean }>(context, 'POST', '/api/admin/login', {
            body: { username: 'admin', password: 'JarkaAdmin123' },
        });

        assert.equal(response.status, 200);
        assert.ok(response.cookie?.startsWith('jarka_session='));
    });

    it('accepts the username case-insensitively', async () => {
        const response = await api(context, 'POST', '/api/admin/login', {
            body: { username: 'ADMIN', password: 'JarkaAdmin123' },
        });
        assert.equal(response.status, 200);
    });

    it('gives the same answer for a wrong password and an unknown user', async () => {
        const wrongPassword = await api<{ error: string }>(context, 'POST', '/api/admin/login', {
            body: { username: 'admin', password: 'nespravne' },
        });
        const unknownUser = await api<{ error: string }>(context, 'POST', '/api/admin/login', {
            body: { username: 'niekto-iny', password: 'JarkaAdmin123' },
        });

        assert.equal(wrongPassword.status, 401);
        assert.equal(unknownUser.status, 401);
        assert.equal(wrongPassword.body.error, unknownUser.body.error);
        assert.equal(wrongPassword.cookie, null);
    });

    it('does not accept a query operator as a username', async () => {
        const response = await api(context, 'POST', '/api/admin/login', {
            body: { username: { $ne: null }, password: 'JarkaAdmin123' },
        });
        assert.equal(response.status, 401);
    });

    it('never stores the password in readable form', async () => {
        const { User } = await import('../src/models/User.js');
        const user = await User.findOne({ username: 'admin' }).lean();

        assert.ok(user?.passwordHash.startsWith('$2'));
        assert.ok(!user?.passwordHash.includes('JarkaAdmin123'));
    });

    for (const [method, endpoint] of PROTECTED) {
        it(`refuses ${method} ${endpoint} without a session`, async () => {
            const response = await api<{ error: string }>(context, method, endpoint, { body: {} });
            assert.equal(response.status, 401);
            assert.equal(response.body.error, 'Neprihlásený');
        });
    }

    it('refuses a forged session cookie', async () => {
        const forged = 'jarka_session=eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4ifQ.not-a-real-signature';
        const response = await api<{ error: string }>(context, 'GET', '/api/admin/me', { cookie: forged });

        assert.equal(response.status, 401);
        assert.equal(response.body.error, 'Neplatná relácia');
    });

    it('refuses an unsigned alg:none token', async () => {
        // {"alg":"none","typ":"JWT"}.{"role":"admin"} with an empty signature.
        const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
        const payload = Buffer.from(JSON.stringify({ role: 'admin' })).toString('base64url');
        const response = await api(context, 'GET', '/api/admin/me', {
            cookie: `jarka_session=${header}.${payload}.`,
        });

        assert.equal(response.status, 401);
    });

    it('lets a signed-in admin through and drops the session on logout', async () => {
        const cookie = await loginAsAdmin(context);

        const before = await api<{ ok: boolean }>(context, 'GET', '/api/admin/me', { cookie });
        assert.equal(before.status, 200);

        const logout = await api(context, 'POST', '/api/admin/logout', { cookie });
        assert.equal(logout.status, 200);
        assert.match(logout.cookie ?? '', /^jarka_session=/);
    });
});
