import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { after, before, beforeEach, describe, it } from 'node:test';
import sharp from 'sharp';
import { Photo } from '../src/models/Photo.js';
import { api, loginOnce, resetData, resetUploads, startTestServer, stopTestServer, type TestContext } from './support.js';

let context: TestContext;
let cookie: string;

before(async () => {
    context = await startTestServer();
    cookie = await loginOnce(context);
});
after(stopTestServer);
beforeEach(async () => {
    await resetData();
    await resetUploads();
});

async function pngBlob(width = 40, height = 60, colour = { r: 200, g: 120, b: 80 }): Promise<Blob> {
    const buffer = await sharp({ create: { width, height, channels: 3, background: colour } })
        .png()
        .toBuffer();
    return new Blob([new Uint8Array(buffer)], { type: 'image/png' });
}

function galleryDir(category: string): string {
    return path.join(context.uploadDir, 'gallery', category);
}

interface UploadedPhoto {
    id: string;
    category: string;
    url: string;
}

async function upload(files: Blob[], category = 'svadobne') {
    const form = new FormData();
    files.forEach((file, index) => form.append('photos', file, `photo-${index}.png`));
    return api<UploadedPhoto[]>(context, 'POST', `/api/admin/photos/${category}`, { cookie, form });
}

describe('photo upload', () => {
    it('converts to WebP and writes the file into the upload volume', async () => {
        const response = await upload([await pngBlob()]);

        assert.equal(response.status, 201);
        const photo = response.body[0];
        assert.ok(photo);
        assert.match(photo.url, /^\/images\/gallery\/svadobne\/[\w-]+\.webp$/);

        const files = await readdir(galleryDir('svadobne'));
        assert.equal(files.length, 1);

        const written = await readFile(path.join(galleryDir('svadobne'), files[0] as string));
        assert.equal((await sharp(written).metadata()).format, 'webp');
    });

    it('scales anything oversized down to 1600px on the long edge', async () => {
        await upload([await pngBlob(3000, 2000)]);

        const files = await readdir(galleryDir('svadobne'));
        const metadata = await sharp(path.join(galleryDir('svadobne'), files[0] as string)).metadata();

        assert.equal(metadata.width, 1600);
        assert.ok((metadata.height ?? 0) <= 1600);
    });

    it('leaves a smaller photo at its own size', async () => {
        await upload([await pngBlob(300, 400)]);

        const files = await readdir(galleryDir('svadobne'));
        const metadata = await sharp(path.join(galleryDir('svadobne'), files[0] as string)).metadata();
        assert.equal(metadata.width, 300);
    });

    it('accepts a batch and numbers it in order', async () => {
        const response = await upload([await pngBlob(), await pngBlob(50, 50), await pngBlob(60, 60)]);

        assert.equal(response.status, 201);
        assert.equal(response.body.length, 3);
        const stored = await Photo.find({ category: 'svadobne' }).sort({ order: 1 }).lean();
        assert.deepEqual(
            stored.map((photo) => photo.order),
            [0, 1, 2],
        );
    });

    it('appends to a category that already has photos', async () => {
        await Photo.create({ category: 'svadobne', url: '/assets/existing.webp', order: 0 });
        await upload([await pngBlob()]);

        const stored = await Photo.find({ category: 'svadobne' }).sort({ order: 1 }).lean();
        assert.equal(stored.length, 2);
        assert.equal(stored[1]?.order, 1);
    });

    it('rejects a file that is not an image, whatever it claims to be', async () => {
        const form = new FormData();
        form.append('photos', new Blob([new Uint8Array([1, 2, 3, 4])], { type: 'image/png' }), 'fake.png');

        const response = await api<{ error: string }>(context, 'POST', '/api/admin/photos/svadobne', { cookie, form });

        assert.equal(response.status, 400);
        assert.equal(await Photo.countDocuments(), 0);
        await assert.rejects(readdir(galleryDir('svadobne')), 'nothing may be written for a rejected upload');
    });

    it('rejects an unknown category', async () => {
        const response = await upload([await pngBlob()], 'vymyslena');
        assert.equal(response.status, 400);
    });

    it('rejects a request with no file at all', async () => {
        const response = await api<{ error: string }>(context, 'POST', '/api/admin/photos/svadobne', {
            cookie,
            form: new FormData(),
        });
        assert.equal(response.status, 400);
    });
});

describe('photo replace', () => {
    it('writes the new file and removes the old one from the volume', async () => {
        const created = await upload([await pngBlob(100, 100)]);
        const photo = created.body[0];
        assert.ok(photo);
        const originalFile = photo.url.split('/').pop() as string;

        const form = new FormData();
        form.append('photo', await pngBlob(200, 200), 'replacement.png');
        const replaced = await api<UploadedPhoto>(context, 'PUT', `/api/admin/photos/${photo.id}`, { cookie, form });

        assert.equal(replaced.status, 200);
        assert.notEqual(replaced.body.url, photo.url);

        const files = await readdir(galleryDir('svadobne'));
        assert.equal(files.length, 1, 'the replaced file must not linger on the volume');
        assert.ok(!files.includes(originalFile));

        // The database row is updated in place, so ordering and identity survive.
        const stored = await Photo.findById(photo.id).lean();
        assert.equal(stored?.url, replaced.body.url);
    });

    it('keeps the original when the replacement is not a real image', async () => {
        const created = await upload([await pngBlob()]);
        const photo = created.body[0];
        assert.ok(photo);

        const form = new FormData();
        form.append('photo', new Blob([new Uint8Array([9, 9, 9])], { type: 'image/png' }), 'broken.png');
        const response = await api(context, 'PUT', `/api/admin/photos/${photo.id}`, { cookie, form });

        assert.equal(response.status, 400);
        assert.equal((await Photo.findById(photo.id).lean())?.url, photo.url);
        assert.equal((await readdir(galleryDir('svadobne'))).length, 1);
    });

    it('answers 404 for a photo that does not exist', async () => {
        const form = new FormData();
        form.append('photo', await pngBlob(), 'x.png');
        const response = await api(context, 'PUT', '/api/admin/photos/000000000000000000000000', { cookie, form });
        assert.equal(response.status, 404);
    });
});

describe('photo delete', () => {
    it('removes the row and the file from the volume', async () => {
        const created = await upload([await pngBlob()]);
        const photo = created.body[0];
        assert.ok(photo);

        const response = await api(context, 'DELETE', `/api/admin/photos/${photo.id}`, { cookie });

        assert.equal(response.status, 200);
        assert.equal(await Photo.countDocuments(), 0);
        assert.deepEqual(await readdir(galleryDir('svadobne')), []);
    });

    it('drops a linked photo from the database without touching the volume', async () => {
        const created = await upload([await pngBlob()]);
        const uploaded = created.body[0];
        assert.ok(uploaded);

        const linked = await api<UploadedPhoto>(context, 'POST', '/api/admin/photos/svadobne/link', {
            cookie,
            body: { url: 'https://example.com/photo.webp' },
        });
        await api(context, 'DELETE', `/api/admin/photos/${linked.body.id}`, { cookie });

        assert.equal(await Photo.countDocuments(), 1);
        assert.equal((await readdir(galleryDir('svadobne'))).length, 1, 'the uploaded file must survive');
    });

    it('cannot be talked into deleting outside the gallery directory', async () => {
        const escaped = await Photo.create({
            category: 'svadobne',
            url: '/images/gallery/../../../etc/passwd',
            order: 0,
        });

        const response = await api(context, 'DELETE', `/api/admin/photos/${escaped._id}`, { cookie });
        assert.equal(response.status, 200);
        assert.equal(await Photo.countDocuments(), 0);
    });
});

describe('photo link', () => {
    it('stores an https link', async () => {
        const response = await api<UploadedPhoto>(context, 'POST', '/api/admin/photos/svadobne/link', {
            cookie,
            body: { url: 'https://example.com/saty.webp' },
        });

        assert.equal(response.status, 201);
        assert.equal(response.body.url, 'https://example.com/saty.webp');
    });

    for (const url of ['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'file:///etc/passwd', 'nonsense']) {
        it(`refuses ${url.slice(0, 24)}`, async () => {
            const response = await api(context, 'POST', '/api/admin/photos/svadobne/link', { cookie, body: { url } });
            assert.equal(response.status, 400);
            assert.equal(await Photo.countDocuments(), 0);
        });
    }

    it('shows up in the public gallery once stored', async () => {
        await api(context, 'POST', '/api/admin/photos/obuv/link', {
            cookie,
            body: { url: 'https://example.com/obuv.webp' },
        });

        const gallery = await api<Record<string, string[]>>(context, 'GET', '/api/gallery');
        assert.deepEqual(gallery.body.obuv, ['https://example.com/obuv.webp']);
    });
});

describe('photo order', () => {
    async function seedThree() {
        const created = await upload([await pngBlob(10, 10), await pngBlob(20, 20), await pngBlob(30, 30)]);
        return created.body.map((photo) => photo.id);
    }

    it('rewrites the order and the public gallery follows it', async () => {
        const [first, second, third] = await seedThree();
        assert.ok(first && second && third);

        const response = await api(context, 'PUT', '/api/admin/photos/svadobne/order', {
            cookie,
            body: { ids: [third, first, second] },
        });
        assert.equal(response.status, 200);

        const stored = await Photo.find({ category: 'svadobne' }).sort({ order: 1 }).lean();
        assert.deepEqual(
            stored.map((photo) => String(photo._id)),
            [third, first, second],
        );

        const gallery = await api<Record<string, string[]>>(context, 'GET', '/api/gallery');
        const urls = new Map(stored.map((photo) => [String(photo._id), photo.url]));
        assert.deepEqual(gallery.body.svadobne, [urls.get(third), urls.get(first), urls.get(second)]);
    });

    it('refuses a partial list, because it would scramble the rest', async () => {
        const [first, second] = await seedThree();
        assert.ok(first && second);

        const response = await api<{ error: string }>(context, 'PUT', '/api/admin/photos/svadobne/order', {
            cookie,
            body: { ids: [second, first] },
        });
        assert.equal(response.status, 409);
    });

    it('refuses duplicates and ids from another category', async () => {
        const ids = await seedThree();
        const other = await upload([await pngBlob()], 'obuv');
        const strayId = other.body[0]?.id;
        assert.ok(strayId && ids[0] && ids[1]);

        const duplicated = await api(context, 'PUT', '/api/admin/photos/svadobne/order', {
            cookie,
            body: { ids: [ids[0], ids[0], ids[1]] },
        });
        assert.equal(duplicated.status, 409);

        const foreign = await api(context, 'PUT', '/api/admin/photos/svadobne/order', {
            cookie,
            body: { ids: [ids[0], ids[1], strayId] },
        });
        assert.equal(foreign.status, 409);
    });

    it('rejects a malformed id and an unknown category', async () => {
        await seedThree();

        const badId = await api(context, 'PUT', '/api/admin/photos/svadobne/order', {
            cookie,
            body: { ids: ['nie-je-objectid'] },
        });
        assert.equal(badId.status, 400);

        const badCategory = await api(context, 'PUT', '/api/admin/photos/vymyslena/order', {
            cookie,
            body: { ids: ['000000000000000000000000'] },
        });
        assert.equal(badCategory.status, 400);
    });

    it('requires a session', async () => {
        const response = await api(context, 'PUT', '/api/admin/photos/svadobne/order', {
            body: { ids: ['000000000000000000000000'] },
        });
        assert.equal(response.status, 401);
    });

    it('keeps newly uploaded photos after the reordered ones', async () => {
        const [first, second, third] = await seedThree();
        assert.ok(first && second && third);

        await api(context, 'PUT', '/api/admin/photos/svadobne/order', { cookie, body: { ids: [third, second, first] } });
        const added = await upload([await pngBlob(44, 44)]);

        const stored = await Photo.find({ category: 'svadobne' }).sort({ order: 1 }).lean();
        assert.equal(String(stored[3]?._id), added.body[0]?.id);
    });
});

describe('instagram category', () => {
    it('is a normal gallery category the public endpoint exposes', async () => {
        await upload([await pngBlob()], 'instagram');

        const gallery = await api<Record<string, string[]>>(context, 'GET', '/api/gallery');
        assert.equal(gallery.body.instagram?.length, 1);
        assert.match(gallery.body.instagram?.[0] ?? '', /^\/images\/gallery\/instagram\//);
    });
});
