import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';
import { api, loginOnce, resetData, startTestServer, stopTestServer, type TestContext } from './support.js';

let context: TestContext;
let cookie: string;

before(async () => {
    context = await startTestServer();
    cookie = await loginOnce(context);
});
after(stopTestServer);
beforeEach(async () => {
    await resetData();
    await User.deleteMany({ username: { $ne: 'admin' } });
});

interface ListedUser {
    id: string;
    username: string;
    role: string;
    isSelf: boolean;
}

const list = () => api<ListedUser[]>(context, 'GET', '/api/admin/users', { cookie });

async function addUser(username: string, password = 'HesloJarka1') {
    return api<{ id: string; username: string }>(context, 'POST', '/api/admin/users', {
        cookie,
        body: { username, password },
    });
}

describe('listing users', () => {
    it('never exposes a password hash and marks the signed-in account', async () => {
        const response = await list();

        assert.equal(response.status, 200);
        assert.equal(response.body.length, 1);
        assert.equal(response.body[0]?.username, 'admin');
        assert.equal(response.body[0]?.isSelf, true);
        assert.ok(!JSON.stringify(response.body).includes('passwordHash'));
        assert.ok(!JSON.stringify(response.body).includes('$2b$'));
    });

    it('requires a session', async () => {
        const response = await api(context, 'GET', '/api/admin/users');
        assert.equal(response.status, 401);
    });
});

describe('creating a user', () => {
    it('stores a bcrypt hash and lets the new account sign in', async () => {
        const created = await addUser('jarka');
        assert.equal(created.status, 201);

        const stored = await User.findById(created.body.id).lean();
        assert.ok(stored?.passwordHash.startsWith('$2'));
        assert.ok(await bcrypt.compare('HesloJarka1', stored.passwordHash));

        const login = await api(context, 'POST', '/api/admin/login', {
            body: { username: 'jarka', password: 'HesloJarka1' },
        });
        assert.equal(login.status, 200);
    });

    it('lowercases the username so sign-in is case-insensitive', async () => {
        await addUser('Jarka');
        const stored = await User.findOne({ username: 'jarka' }).lean();
        assert.ok(stored);
    });

    it('refuses a duplicate name', async () => {
        await addUser('jarka');
        const again = await addUser('jarka');

        assert.equal(again.status, 409);
        assert.equal(await User.countDocuments({ username: 'jarka' }), 1);
    });

    for (const [label, password] of [
        ['too short', 'Kratke1'],
        ['no digit', 'HesloBezCislic'],
        ['no letter', '1234567890'],
    ] as const) {
        it(`refuses a password that is ${label}`, async () => {
            const response = await api<{ error: string }>(context, 'POST', '/api/admin/users', {
                cookie,
                body: { username: 'novy', password },
            });
            assert.equal(response.status, 400);
            assert.equal(await User.countDocuments({ username: 'novy' }), 0);
        });
    }

    it('refuses a username with characters that would not survive a login', async () => {
        const response = await api(context, 'POST', '/api/admin/users', {
            cookie,
            body: { username: 'jarka žena', password: 'HesloJarka1' },
        });
        assert.equal(response.status, 400);
    });
});

describe('changing your own password', () => {
    it('requires the current password and then accepts the new one', async () => {
        const wrong = await api<{ error: string }>(context, 'PATCH', '/api/admin/users/me/password', {
            cookie,
            body: { currentPassword: 'nespravne', newPassword: 'NoveHeslo123' },
        });
        assert.equal(wrong.status, 401);

        const right = await api(context, 'PATCH', '/api/admin/users/me/password', {
            cookie,
            body: { currentPassword: 'JarkaAdmin123', newPassword: 'NoveHeslo123' },
        });
        assert.equal(right.status, 200);

        const stored = await User.findOne({ username: 'admin' }).lean();
        assert.ok(await bcrypt.compare('NoveHeslo123', stored!.passwordHash));

        // Put it back so the shared session helper still works for later files.
        await api(context, 'PATCH', '/api/admin/users/me/password', {
            cookie,
            body: { currentPassword: 'NoveHeslo123', newPassword: 'JarkaAdmin123' },
        });
    });

    it('enforces the same password rules as creation', async () => {
        const response = await api(context, 'PATCH', '/api/admin/users/me/password', {
            cookie,
            body: { currentPassword: 'JarkaAdmin123', newPassword: 'kratke' },
        });
        assert.equal(response.status, 400);
    });
});

describe('resetting someone else password', () => {
    it('sets it without knowing the old one', async () => {
        const created = await addUser('jarka');

        const response = await api(context, 'PATCH', `/api/admin/users/${created.body.id}/password`, {
            cookie,
            body: { password: 'ZabudnutaJar1' },
        });
        assert.equal(response.status, 200);

        const login = await api(context, 'POST', '/api/admin/login', {
            body: { username: 'jarka', password: 'ZabudnutaJar1' },
        });
        assert.equal(login.status, 200);
    });

    it('refuses to be used on your own account', async () => {
        const users = await list();
        const self = users.body.find((user) => user.isSelf);
        assert.ok(self);

        const response = await api<{ error: string }>(context, 'PATCH', `/api/admin/users/${self.id}/password`, {
            cookie,
            body: { password: 'ObchadzkaKontroly1' },
        });
        assert.equal(response.status, 400);

        // The old password still works, so the current-password check was not bypassed.
        const stored = await User.findById(self.id).lean();
        assert.ok(await bcrypt.compare('JarkaAdmin123', stored!.passwordHash));
    });

    it('answers 404 for an unknown account', async () => {
        const response = await api(context, 'PATCH', '/api/admin/users/000000000000000000000000/password', {
            cookie,
            body: { password: 'NejakeHeslo1' },
        });
        assert.equal(response.status, 404);
    });
});

describe('deleting a user', () => {
    it('removes a colleague', async () => {
        const created = await addUser('jarka');

        const response = await api(context, 'DELETE', `/api/admin/users/${created.body.id}`, { cookie });
        assert.equal(response.status, 200);
        assert.equal(await User.countDocuments(), 1);
    });

    it('refuses to delete your own account', async () => {
        await addUser('jarka');
        const users = await list();
        const self = users.body.find((user) => user.isSelf);
        assert.ok(self);

        const response = await api<{ error: string }>(context, 'DELETE', `/api/admin/users/${self.id}`, { cookie });
        assert.equal(response.status, 400);
        assert.ok(await User.findById(self.id));
    });

    it('refuses to empty the users collection', async () => {
        // Only the signed-in admin is left; deleting anyone would be deleting self,
        // but the count guard has to hold even if that check were bypassed.
        assert.equal(await User.countDocuments(), 1);

        const stray = await User.create({ username: 'docasny', passwordHash: await bcrypt.hash('Docasne123', 4) });
        await User.deleteOne({ username: 'admin' });

        const response = await api<{ error: string }>(context, 'DELETE', `/api/admin/users/${stray._id}`, { cookie });
        assert.equal(response.status, 400);
        assert.match(response.body.error, /aspoň jeden/);
        assert.equal(await User.countDocuments(), 1);
    });
});
