// Side-effect import: sets UPLOAD_DIR before src/env.ts reads it. Must stay first.
import './env-setup.js';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import type { Server } from 'node:http';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { env } from '../src/env.js';
import { Photo } from '../src/models/Photo.js';
import { Reservation } from '../src/models/Reservation.js';
import { Settings } from '../src/models/Settings.js';
import { User } from '../src/models/User.js';

/**
 * These tests drop their whole database on teardown, so running them against a
 * real cluster has to be impossible rather than merely discouraged. A stray .env
 * with an Atlas MONGODB_URI is exactly the accident this catches.
 */
function assertDisposableTarget(uri: string, dbName: string): void {
    if (/mongodb\+srv/i.test(uri)) {
        throw new Error('Refusing to run tests against a mongodb+srv cluster.');
    }
    if (!/^jarka_test_/.test(dbName)) {
        throw new Error(`Refusing to drop "${dbName}" — test databases must be named jarka_test_*.`);
    }
}

export interface TestContext {
    url: string;
    uploadDir: string;
}

/**
 * Node runs each test file in its own process, in parallel. They would otherwise
 * share one database and wipe each other's fixtures between cases, so the file
 * name becomes the database name.
 */
function databaseForThisFile(): string {
    const entry = path.basename(process.argv[1] ?? 'unknown').replace(/\.[cm]?ts$/, '');
    return `jarka_test_${entry.replace(/[^a-z0-9]+/gi, '_')}`;
}

let server: Server | undefined;
let uploadDir = '';

export async function startTestServer(): Promise<TestContext> {
    const dbName = databaseForThisFile();
    assertDisposableTarget(env.MONGODB_URI, dbName);

    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000, dbName });

    // env-setup gave this process its own directory.
    uploadDir = env.UPLOAD_DIR;

    const app = createApp();
    server = app.listen(0);
    await new Promise((resolve) => server?.once('listening', resolve));

    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Server did not bind to a port');
    return { url: `http://127.0.0.1:${address.port}`, uploadDir };
}

export async function stopTestServer(): Promise<void> {
    await new Promise((resolve) => server?.close(resolve));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await rm(uploadDir, { recursive: true, force: true });
}

/** Clears fixture data between tests. Leaves the admin account alone: see loginOnce. */
export async function resetData(): Promise<void> {
    await Promise.all([Reservation.deleteMany({}), Photo.deleteMany({}), Settings.deleteMany({})]);
}

export async function resetUsers(): Promise<void> {
    await User.deleteMany({});
}

/** Empties the upload volume so a test can count files without inheriting the last one's. */
export async function resetUploads(): Promise<void> {
    await rm(path.join(uploadDir, 'gallery'), { recursive: true, force: true });
}

/**
 * The login limiter allows ten attempts per process, so a file with more than ten
 * tests cannot log in per test. The session is a signed JWT that is never looked
 * up against the users collection, so one cookie lasts the whole file.
 */
export async function loginOnce(context: TestContext): Promise<string> {
    await resetUsers();
    await createAdmin();
    return loginAsAdmin(context);
}

export async function createAdmin(username = 'admin', password = 'JarkaAdmin123'): Promise<void> {
    await User.create({ username, passwordHash: await bcrypt.hash(password, 4), role: 'admin' });
}

interface ApiResponse<T> {
    status: number;
    body: T;
    cookie: string | null;
}

export async function api<T = unknown>(
    context: TestContext,
    method: string,
    endpoint: string,
    options: { body?: unknown; cookie?: string | null; form?: FormData } = {},
): Promise<ApiResponse<T>> {
    const sendsBody = method !== 'GET' && method !== 'HEAD';
    const headers: Record<string, string> = {};
    if (options.cookie) headers.cookie = options.cookie;
    if (sendsBody && options.body !== undefined) headers['content-type'] = 'application/json';

    const payload = options.form ?? (options.body === undefined ? undefined : JSON.stringify(options.body));

    const response = await fetch(`${context.url}${endpoint}`, {
        method,
        headers,
        body: sendsBody ? payload : undefined,
    });

    const raw = await response.text();
    let body: unknown = raw;
    try {
        body = JSON.parse(raw);
    } catch {
        // Some responses are not JSON; the raw text is more useful in the assertion.
    }

    const setCookie = response.headers.get('set-cookie');
    return { status: response.status, body: body as T, cookie: setCookie ? (setCookie.split(';')[0] ?? null) : null };
}

export async function loginAsAdmin(context: TestContext): Promise<string> {
    const response = await api<{ ok: boolean }>(context, 'POST', '/api/admin/login', {
        body: { username: 'admin', password: 'JarkaAdmin123' },
    });
    if (!response.cookie) throw new Error(`Login failed: ${response.status} ${JSON.stringify(response.body)}`);
    return response.cookie;
}

/** A weekday the opening-hours table always has slots for (Wednesday). */
export const OPEN_DATE = '2027-03-10';
/** Sunday, closed. */
export const CLOSED_DATE = '2027-03-14';
