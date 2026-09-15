import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildMergePayload } from '../src/services/mailchimp.js';

const inquiry = {
    firstName: 'Jana',
    lastName: 'Nováková',
    phone: '+421 900 111 222',
    email: 'jana@example.sk',
    cat: 'Svadobné šaty',
    date: '2027-03-10',
    time: '11:15',
};

describe('the Mailchimp payload', () => {
    it('sends every field under its tag name and its positional alias', () => {
        const payload = buildMergePayload(inquiry);

        assert.deepEqual(Object.keys(payload).sort(), [
            'EMAIL',
            'FNAME',
            'LNAME',
            'MERGE0',
            'MERGE1',
            'MERGE2',
            'MERGE4',
            'PHONE',
            'REQDATE',
            'REQTIME',
            'TYPE',
        ]);
        assert.equal(payload.MERGE0, payload.EMAIL);
        assert.equal(payload.MERGE1, payload.FNAME);
        assert.equal(payload.MERGE2, payload.LNAME);
        assert.equal(payload.MERGE4, payload.PHONE);
    });

    it('maps each form field to its tag', () => {
        const payload = buildMergePayload(inquiry);

        assert.equal(payload.EMAIL, 'jana@example.sk');
        assert.equal(payload.PHONE, '+421 900 111 222');
        assert.equal(payload.TYPE, 'Svadobné šaty');
        assert.equal(payload.REQDATE, '2027-03-10');
        assert.equal(payload.REQTIME, '11:15');
    });

    it('keeps the two names in their own fields', () => {
        const payload = buildMergePayload(inquiry);

        assert.equal(payload.FNAME, 'Jana');
        assert.equal(payload.LNAME, 'Nováková');
    });

    it('sends the date as ISO 8601 and the time in 24h', () => {
        const payload = buildMergePayload(inquiry);

        assert.match(payload.REQDATE ?? '', /^\d{4}-\d{2}-\d{2}$/);
        assert.match(payload.REQTIME ?? '', /^\d{1,2}:\d{2}$/);
    });

    it('url-encodes cleanly, diacritics included', () => {
        const body = new URLSearchParams(buildMergePayload(inquiry) as unknown as Record<string, string>);
        const parsed = new URLSearchParams(body.toString());

        assert.equal(parsed.get('FNAME'), 'Jana');
        assert.equal(parsed.get('TYPE'), 'Svadobné šaty');
    });
});

describe('the API payload', () => {
    it('keeps EMAIL out of merge_fields, where Mailchimp rejects it', () => {
        const { EMAIL, ...merge } = buildMergePayload(inquiry);

        assert.equal(EMAIL, 'jana@example.sk');
        assert.ok(!('EMAIL' in merge));
        assert.ok('FNAME' in merge && 'LNAME' in merge && 'PHONE' in merge);
        assert.ok('TYPE' in merge && 'REQDATE' in merge && 'REQTIME' in merge);
    });
});
