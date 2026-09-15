import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { Photo } from '../src/models/Photo.js';
import { Reservation } from '../src/models/Reservation.js';
import { api, CLOSED_DATE, OPEN_DATE, resetData, startTestServer, stopTestServer, type TestContext } from './support.js';

let context: TestContext;

before(async () => {
    context = await startTestServer();
});
after(stopTestServer);
beforeEach(resetData);

describe('GET /api/health', () => {
    it('reports ok while the database is connected', async () => {
        const response = await api<{ status: string }>(context, 'GET', '/api/health');
        assert.equal(response.status, 200);
        assert.equal(response.body.status, 'ok');
    });
});

describe('GET /api/gallery', () => {
    it('returns every category, empty ones included', async () => {
        const response = await api<Record<string, string[]>>(context, 'GET', '/api/gallery');

        assert.equal(response.status, 200);
        assert.deepEqual(Object.keys(response.body).sort(), [
            'galeria',
            'instagram',
            'obuv',
            'prijimacie',
            'spolocenske',
            'svadobne',
            'zenich',
        ]);
        assert.deepEqual(response.body.svadobne, []);
    });

    it('groups photos by category and honours the order field', async () => {
        await Photo.create([
            { category: 'svadobne', url: '/assets/b.webp', order: 1 },
            { category: 'svadobne', url: '/assets/a.webp', order: 0 },
            { category: 'obuv', url: '/assets/c.webp', order: 0 },
        ]);

        const response = await api<Record<string, string[]>>(context, 'GET', '/api/gallery');
        assert.deepEqual(response.body.svadobne, ['/assets/a.webp', '/assets/b.webp']);
        assert.deepEqual(response.body.obuv, ['/assets/c.webp']);
    });
});

describe('GET /api/availability', () => {
    it('rejects a malformed date', async () => {
        const response = await api<{ error: string }>(context, 'GET', '/api/availability?date=10-03-2027');
        assert.equal(response.status, 400);
        assert.equal(response.body.error, 'Neplatný dátum');
    });

    it('returns slots inside the opening hours for an open day', async () => {
        const response = await api<{ slots: string[]; duration: number }>(context, 'GET', `/api/availability?date=${OPEN_DATE}`);

        assert.equal(response.status, 200);
        assert.equal(response.body.duration, 60);
        assert.ok(response.body.slots.length > 0);
        assert.equal(response.body.slots[0], '10:00');
        // Opening hours run 10:00–17:00, so nothing may start at or after 17:00.
        for (const slot of response.body.slots) {
            const hour = Number(slot.split(':')[0]);
            assert.ok(hour >= 10 && hour < 17, `${slot} falls outside opening hours`);
        }
    });

    it('returns nothing for a closed day', async () => {
        const response = await api<{ slots: string[] }>(context, 'GET', `/api/availability?date=${CLOSED_DATE}`);
        assert.deepEqual(response.body.slots, []);
    });

    it('stops offering a slot somebody has already asked for', async () => {
        const before = await api<{ slots: string[] }>(context, 'GET', `/api/availability?date=${OPEN_DATE}`);
        const target = before.body.slots[0];
        assert.ok(target);

        // Nothing gets approved any more, so an inquiry holds its slot outright.
        await Reservation.create({ name: 'Prvá', date: OPEN_DATE, time: target });

        const after = await api<{ slots: string[] }>(context, 'GET', `/api/availability?date=${OPEN_DATE}`);
        assert.ok(!after.body.slots.includes(target));
    });
});

describe('POST /api/reservations', () => {
    const valid = {
        name: 'Jana Nováková',
        phone: '+421 900 111 222',
        email: 'jana@example.sk',
        cat: 'Svadobné šaty',
        date: OPEN_DATE,
        time: '10:00',
    };

    it('stores the inquiry unhandled', async () => {
        const response = await api<{ ok: boolean }>(context, 'POST', '/api/reservations', { body: valid });
        assert.equal(response.status, 201);

        const stored = await Reservation.findOne({ email: valid.email }).lean();
        assert.equal(stored?.handled, false);
        assert.equal(stored?.name, valid.name);
        assert.equal(stored?.cat, valid.cat);
    });

    for (const [label, patch] of [
        ['a missing name', { name: '' }],
        ['a one-character name', { name: 'J' }],
        ['a malformed e-mail', { email: 'nie-je-email' }],
        ['a too-short phone', { phone: '123' }],
        ['a malformed date', { date: '10.03.2027' }],
        ['a malformed time', { time: '25h' }],
    ] as const) {
        it(`rejects ${label}`, async () => {
            const response = await api<{ error: string }>(context, 'POST', '/api/reservations', {
                body: { ...valid, ...patch },
            });
            assert.equal(response.status, 400);
            assert.equal(await Reservation.countDocuments(), 0);
        });
    }

    it('refuses a slot outside the opening hours', async () => {
        const response = await api<{ error: string }>(context, 'POST', '/api/reservations', {
            body: { ...valid, time: '21:00' },
        });
        assert.equal(response.status, 409);
        assert.equal(await Reservation.countDocuments(), 0);
    });

    it('refuses a day the salon is closed', async () => {
        const response = await api(context, 'POST', '/api/reservations', { body: { ...valid, date: CLOSED_DATE } });
        assert.equal(response.status, 409);
    });

    it('refuses a slot already asked for by someone else', async () => {
        await Reservation.create({ name: 'Iná', date: OPEN_DATE, time: '10:00' });

        const response = await api<{ error: string }>(context, 'POST', '/api/reservations', { body: valid });
        assert.equal(response.status, 409);
        assert.match(response.body.error, /obsaden/);
    });

    it('ignores a client trying to mark its own inquiry handled', async () => {
        await api(context, 'POST', '/api/reservations', { body: { ...valid, handled: true } });

        assert.equal((await Reservation.findOne({ email: valid.email }).lean())?.handled, false);
    });

    it('does not fall for an operator object in place of a string', async () => {
        const response = await api(context, 'POST', '/api/reservations', {
            body: { ...valid, email: { $ne: null } },
        });
        assert.equal(response.status, 400);
    });
});

describe('unknown endpoints', () => {
    it('answer 404 as JSON rather than the SPA shell', async () => {
        const response = await api<{ error: string }>(context, 'GET', '/api/neexistuje');
        assert.equal(response.status, 404);
        assert.equal(response.body.error, 'Neznámy endpoint');
    });
});
