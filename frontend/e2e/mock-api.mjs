import { createServer } from 'node:http';

/**
 * Deterministic stand-in for the Express API. The E2E suite asserts on frontend
 * behaviour, so it must never depend on Atlas being reachable or on what happens
 * to be in it.
 */

const PORT = Number(process.env.MOCK_API_PORT) || 4100;

const CATEGORY_PHOTOS = {
    svadobne: [1, 2, 3, 4, 5],
    spolocenske: [1, 2, 3, 4],
    prijimacie: [1, 2],
    zenich: [1, 2, 3, 4, 5],
    obuv: [1, 2, 3, 4, 5, 6, 7],
};

const gallery = {
    ...Object.fromEntries(
        Object.entries(CATEGORY_PHOTOS).map(([key, indexes]) => [key, indexes.map((n) => `/assets/${key}-${n}.webp`)]),
    ),
    galeria: ['/assets/hero.webp', '/assets/svadobne-1.webp', '/assets/spolocenske-2.webp'],
};

const SLOTS = ['10:00', '11:15', '12:30', '13:45', '15:00', '16:15'];
const CREDENTIALS = { username: 'admin', password: 'JarkaAdmin123' };
const SESSION_COOKIE = 'jarka_session';
const SESSION_VALUE = 'e2e-session';

/** Dates the tests use to exercise the "no free slots" branch. */
const FULLY_BOOKED = new Set(['2027-01-04']);

let reservations = [];
let photos = Object.entries(gallery).flatMap(([category, urls]) =>
    urls.map((url, index) => ({ id: `${category}-${index}`, category, url })),
);

function send(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
}

function readBody(req) {
    return new Promise((resolve) => {
        let raw = '';
        req.on('data', (chunk) => (raw += chunk));
        req.on('end', () => {
            try {
                resolve(JSON.parse(raw || '{}'));
            } catch {
                resolve({});
            }
        });
    });
}

function isAuthed(req) {
    return (req.headers.cookie ?? '').includes(`${SESSION_COOKIE}=${SESSION_VALUE}`);
}

const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const { pathname } = url;
    const method = req.method ?? 'GET';

    if (pathname === '/api/health') return send(res, 200, { status: 'ok' });

    if (pathname === '/api/__reset' && method === 'POST') {
        reservations = [];
        return send(res, 200, { ok: true });
    }

    if (pathname === '/api/gallery') return send(res, 200, gallery);

    if (pathname === '/api/availability') {
        const date = url.searchParams.get('date') ?? '';
        const taken = reservations.filter((r) => r.date === date).map((r) => r.time);
        const slots = FULLY_BOOKED.has(date) ? [] : SLOTS.filter((slot) => !taken.includes(slot));
        return send(res, 200, { date, duration: 60, slots });
    }

    if (pathname === '/api/reservations' && method === 'POST') {
        const body = await readBody(req);
        if (reservations.some((r) => r.date === body.date && r.time === body.time)) {
            return send(res, 409, { error: 'Tento termín je už obsadený. Vyberte, prosím, iný čas.' });
        }
        reservations.push(body);
        return send(res, 201, { ok: true });
    }

    if (pathname === '/api/admin/login' && method === 'POST') {
        const body = await readBody(req);
        if (body.username !== CREDENTIALS.username || body.password !== CREDENTIALS.password) {
            return send(res, 401, { error: 'Nesprávne meno alebo heslo.' });
        }
        res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${SESSION_VALUE}; Path=/; HttpOnly; SameSite=Strict`);
        return send(res, 200, { ok: true });
    }

    if (pathname === '/api/admin/logout' && method === 'POST') {
        res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; Max-Age=0`);
        return send(res, 200, { ok: true });
    }

    if (pathname.startsWith('/api/admin')) {
        if (!isAuthed(req)) return send(res, 401, { error: 'Neprihlásený' });
        if (pathname === '/api/admin/me') return send(res, 200, { ok: true });
        if (pathname === '/api/admin/photos') return send(res, 200, photos);
        if (pathname === '/api/admin/reservations') return send(res, 200, []);
        if (pathname === '/api/admin/settings') return send(res, 200, { duration: 60, buffer: 15 });
        if (pathname === '/api/admin/day') return send(res, 200, { date: '', duration: 60, slots: [] });
        return send(res, 200, { ok: true });
    }

    send(res, 404, { error: 'Neznámy endpoint' });
});

server.listen(PORT, () => console.log(`mock api listening on :${PORT}`));
