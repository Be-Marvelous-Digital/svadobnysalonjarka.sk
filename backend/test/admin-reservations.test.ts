import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { Reservation } from '../src/models/Reservation.js';
import { api, loginOnce, OPEN_DATE, resetData, startTestServer, stopTestServer, type TestContext } from './support.js';

let context: TestContext;
let cookie: string;

before(async () => {
    context = await startTestServer();
    cookie = await loginOnce(context);
});
after(stopTestServer);
beforeEach(resetData);

interface ListedInquiry {
    id: string;
    name: string;
    cat: string;
    date: string;
    time: string;
    handled: boolean;
    createdAt: string;
}

const list = () => api<ListedInquiry[]>(context, 'GET', '/api/admin/reservations', { cookie });

describe('the inquiry list', () => {
    it('returns the contact details and the handled flag', async () => {
        await Reservation.create({
            name: 'Jana',
            phone: '+421900111222',
            email: 'jana@example.sk',
            cat: 'Svadobné šaty',
            date: OPEN_DATE,
            time: '10:00',
        });

        const response = await list();

        assert.equal(response.status, 200);
        assert.equal(response.body.length, 1);
        assert.equal(response.body[0]?.name, 'Jana');
        assert.equal(response.body[0]?.cat, 'Svadobné šaty');
        assert.equal(response.body[0]?.handled, false);
        assert.ok(response.body[0]?.createdAt);
    });

    it('puts the newest inquiry first', async () => {
        await Reservation.create({ name: 'Prvá', date: OPEN_DATE, time: '10:00' });
        await new Promise((resolve) => setTimeout(resolve, 10));
        await Reservation.create({ name: 'Druhá', date: OPEN_DATE, time: '11:15' });

        const response = await list();
        assert.equal(response.body[0]?.name, 'Druhá');
    });

    it('requires a session', async () => {
        const response = await api(context, 'GET', '/api/admin/reservations');
        assert.equal(response.status, 401);
    });
});

describe('marking an inquiry handled', () => {
    it('sets and clears the flag', async () => {
        const created = await Reservation.create({ name: 'Jana', date: OPEN_DATE, time: '10:00' });

        await api(context, 'PATCH', `/api/admin/reservations/${created._id}`, { cookie, body: { handled: true } });
        assert.equal((await Reservation.findById(created._id).lean())?.handled, true);

        await api(context, 'PATCH', `/api/admin/reservations/${created._id}`, { cookie, body: { handled: false } });
        assert.equal((await Reservation.findById(created._id).lean())?.handled, false);
    });

    it('is the only change the endpoint accepts', async () => {
        const created = await Reservation.create({ name: 'Jana', date: OPEN_DATE, time: '10:00' });

        const response = await api(context, 'PATCH', `/api/admin/reservations/${created._id}`, {
            cookie,
            body: { name: 'Podvrhnuté' },
        });
        assert.equal(response.status, 400);
        assert.equal((await Reservation.findById(created._id).lean())?.name, 'Jana');
    });

    it('answers 404 for an inquiry that does not exist', async () => {
        const response = await api(context, 'PATCH', '/api/admin/reservations/000000000000000000000000', {
            cookie,
            body: { handled: true },
        });
        assert.equal(response.status, 404);
    });
});

describe('deleting an inquiry', () => {
    it('removes it', async () => {
        const created = await Reservation.create({ name: 'Jana', date: OPEN_DATE, time: '10:00' });

        const response = await api(context, 'DELETE', `/api/admin/reservations/${created._id}`, { cookie });
        assert.equal(response.status, 200);
        assert.equal(await Reservation.countDocuments(), 0);
    });
});

describe('the approval endpoints are gone', () => {
    for (const [method, endpoint] of [
        ['GET', '/api/admin/day?date=2027-03-10'],
        ['POST', '/api/admin/reservations'],
    ] as const) {
        it(`${method} ${endpoint} is no longer served`, async () => {
            const response = await api(context, method, endpoint, { cookie, body: {} });
            assert.equal(response.status, 404);
        });
    }
});
