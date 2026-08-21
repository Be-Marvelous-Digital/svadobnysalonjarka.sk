import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { Reservation } from '../src/models/Reservation.js';
import {
    api,
    CLOSED_DATE,
    loginOnce,
    OPEN_DATE,
    resetData,
    startTestServer,
    stopTestServer,
    type TestContext,
} from './support.js';

let context: TestContext;
let cookie: string;

before(async () => {
    context = await startTestServer();
    cookie = await loginOnce(context);
});
after(stopTestServer);
beforeEach(resetData);

describe('admin reservations', () => {
    it('lists requests with their contact details', async () => {
        await Reservation.create({
            name: 'Jana',
            phone: '+421900111222',
            email: 'jana@example.sk',
            date: OPEN_DATE,
            time: '10:00',
            status: 'pending',
            kind: 'klient',
        });

        const response = await api<Array<{ id: string; name: string; status: string }>>(
            context,
            'GET',
            '/api/admin/reservations',
            { cookie },
        );

        assert.equal(response.status, 200);
        assert.equal(response.body.length, 1);
        assert.equal(response.body[0]?.name, 'Jana');
        assert.equal(response.body[0]?.status, 'pending');
        assert.ok(response.body[0]?.id);
    });

    it('creates an owner booking as already confirmed', async () => {
        const response = await api<{ id: string }>(context, 'POST', '/api/admin/reservations', {
            cookie,
            body: { name: 'Osobne dohodnuté', date: OPEN_DATE, time: '11:15', kind: 'majitelka' },
        });

        assert.equal(response.status, 201);
        const stored = await Reservation.findById(response.body.id).lean();
        assert.equal(stored?.status, 'confirmed');
    });

    it('creates a block as blocked', async () => {
        const response = await api<{ id: string }>(context, 'POST', '/api/admin/reservations', {
            cookie,
            body: { name: 'Dovolenka', date: OPEN_DATE, time: '11:15', kind: 'blok' },
        });

        const stored = await Reservation.findById(response.body.id).lean();
        assert.equal(stored?.status, 'blocked');
    });

    it('refuses to double-book a slot', async () => {
        await api(context, 'POST', '/api/admin/reservations', {
            cookie,
            body: { name: 'Prvá', date: OPEN_DATE, time: '11:15', kind: 'majitelka' },
        });

        const second = await api<{ error: string }>(context, 'POST', '/api/admin/reservations', {
            cookie,
            body: { name: 'Druhá', date: OPEN_DATE, time: '11:15', kind: 'majitelka' },
        });

        assert.equal(second.status, 409);
        assert.equal(await Reservation.countDocuments(), 1);
    });

    it('confirms a pending request', async () => {
        const created = await Reservation.create({
            name: 'Jana',
            date: OPEN_DATE,
            time: '10:00',
            status: 'pending',
            kind: 'klient',
        });

        const response = await api(context, 'PATCH', `/api/admin/reservations/${created._id}`, {
            cookie,
            body: { status: 'confirmed' },
        });

        assert.equal(response.status, 200);
        assert.equal((await Reservation.findById(created._id).lean())?.status, 'confirmed');
    });

    it('will not confirm a second request for a slot already taken', async () => {
        await Reservation.create({ name: 'Prvá', date: OPEN_DATE, time: '10:00', status: 'confirmed', kind: 'klient' });
        const clash = await Reservation.create({
            name: 'Druhá',
            date: OPEN_DATE,
            time: '10:00',
            status: 'pending',
            kind: 'klient',
        });

        const response = await api<{ error: string }>(context, 'PATCH', `/api/admin/reservations/${clash._id}`, {
            cookie,
            body: { status: 'confirmed' },
        });

        assert.equal(response.status, 409);
        assert.equal((await Reservation.findById(clash._id).lean())?.status, 'pending');
    });

    it('records an alternative date and time offered to the client', async () => {
        const created = await Reservation.create({
            name: 'Jana',
            date: OPEN_DATE,
            time: '10:00',
            status: 'pending',
            kind: 'klient',
        });

        await api(context, 'PATCH', `/api/admin/reservations/${created._id}`, {
            cookie,
            body: { status: 'rejected', altDate: '2027-03-11', altTime: '13:45' },
        });

        const stored = await Reservation.findById(created._id).lean();
        assert.equal(stored?.status, 'rejected');
        assert.equal(stored?.altDate, '2027-03-11');
        assert.equal(stored?.altTime, '13:45');
    });

    it('rejects an unknown status and a malformed id', async () => {
        const created = await Reservation.create({
            name: 'Jana',
            date: OPEN_DATE,
            time: '10:00',
            status: 'pending',
            kind: 'klient',
        });

        const badStatus = await api(context, 'PATCH', `/api/admin/reservations/${created._id}`, {
            cookie,
            body: { status: 'vymyslene' },
        });
        assert.equal(badStatus.status, 400);

        const badId = await api(context, 'PATCH', '/api/admin/reservations/nie-je-objectid', {
            cookie,
            body: { status: 'confirmed' },
        });
        assert.equal(badId.status, 400);
    });

    it('answers 404 for a well-formed id that does not exist', async () => {
        const response = await api(context, 'PATCH', '/api/admin/reservations/000000000000000000000000', {
            cookie,
            body: { status: 'confirmed' },
        });
        assert.equal(response.status, 404);
    });

    it('deletes a reservation', async () => {
        const created = await Reservation.create({
            name: 'Jana',
            date: OPEN_DATE,
            time: '10:00',
            status: 'pending',
            kind: 'klient',
        });

        const response = await api(context, 'DELETE', `/api/admin/reservations/${created._id}`, { cookie });
        assert.equal(response.status, 200);
        assert.equal(await Reservation.countDocuments(), 0);
    });
});

describe('admin day view', () => {
    it('returns every slot for the day, marking the taken ones', async () => {
        await Reservation.create({ name: 'Jana', date: OPEN_DATE, time: '10:00', status: 'confirmed', kind: 'klient' });

        const response = await api<{ slots: Array<{ time: string; reservation: { name: string } | null }> }>(
            context,
            'GET',
            `/api/admin/day?date=${OPEN_DATE}`,
            { cookie },
        );

        assert.equal(response.status, 200);
        const taken = response.body.slots.find((slot) => slot.time === '10:00');
        assert.equal(taken?.reservation?.name, 'Jana');
        assert.ok(response.body.slots.some((slot) => slot.reservation === null));
    });

    it('returns no slots for a closed day', async () => {
        const response = await api<{ slots: unknown[] }>(context, 'GET', `/api/admin/day?date=${CLOSED_DATE}`, { cookie });
        assert.deepEqual(response.body.slots, []);
    });
});

describe('admin settings', () => {
    it('starts from the defaults and persists a change', async () => {
        const initial = await api<{ duration: number; buffer: number }>(context, 'GET', '/api/admin/settings', { cookie });
        assert.deepEqual(initial.body, { duration: 60, buffer: 15 });

        const updated = await api(context, 'PUT', '/api/admin/settings', { cookie, body: { duration: 90, buffer: 0 } });
        assert.equal(updated.status, 200);

        const reread = await api<{ duration: number }>(context, 'GET', '/api/admin/settings', { cookie });
        assert.equal(reread.body.duration, 90);
    });

    it('refuses values outside the allowed range', async () => {
        const response = await api(context, 'PUT', '/api/admin/settings', { cookie, body: { duration: 5, buffer: 0 } });
        assert.equal(response.status, 400);
    });

    it('applies the configured duration to public availability', async () => {
        await api(context, 'PUT', '/api/admin/settings', { cookie, body: { duration: 120, buffer: 0 } });

        const response = await api<{ duration: number; slots: string[] }>(context, 'GET', `/api/availability?date=${OPEN_DATE}`);
        assert.equal(response.body.duration, 120);
        // 10:00–17:00 fits three two-hour visits with no buffer.
        assert.equal(response.body.slots.length, 3);
    });
});
