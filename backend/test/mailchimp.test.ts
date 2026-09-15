import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildMergePayload } from '../src/services/mailchimp.js';

const inquiry = {
    name: 'Jana Nováková',
    phone: '+421 900 111 222',
    email: 'jana@example.sk',
    cat: 'Svadobné šaty',
    date: '2027-03-10',
    time: '11:15',
};

describe('the Mailchimp payload', () => {
    it('maps the form onto the audience merge tags', () => {
        const payload = buildMergePayload(inquiry);

        assert.deepEqual(Object.keys(payload).sort(), ['EMAIL', 'FNAME', 'MSG', 'PHONE', 'REQDATE']);
        assert.equal(payload.EMAIL, 'jana@example.sk');
        assert.equal(payload.PHONE, '+421 900 111 222');
    });

    it('sends only the first name in FNAME, so greetings read correctly', () => {
        assert.equal(buildMergePayload(inquiry).FNAME, 'Jana');
    });

    it('keeps the surname in the message rather than losing it', () => {
        assert.match(buildMergePayload(inquiry).MSG, /Priezvisko: Nováková/);
    });

    it('sends REQDATE as ISO 8601', () => {
        assert.equal(buildMergePayload(inquiry).REQDATE, '2027-03-10');
    });

    it('writes the requested date and time into the message in Slovak', () => {
        const { MSG } = buildMergePayload(inquiry);

        assert.match(MSG, /Jana Nováková má záujem o termín skúšky/);
        assert.match(MSG, /Požadovaný termín: 10\. marca 2027 o 11:15/);
        assert.match(MSG, /Typ šiat: Svadobné šaty/);
        assert.match(MSG, /Telefón: \+421 900 111 222/);
    });

    it('copes with a single-word name', () => {
        const payload = buildMergePayload({ ...inquiry, name: 'Jana' });

        assert.equal(payload.FNAME, 'Jana');
        assert.ok(!payload.MSG.includes('Priezvisko:'));
    });

    it('copes with a middle name by keeping everything after the first word', () => {
        assert.match(buildMergePayload({ ...inquiry, name: 'Jana Mária Nováková' }).MSG, /Priezvisko: Mária Nováková/);
    });

    it('says so when no category was chosen', () => {
        assert.match(buildMergePayload({ ...inquiry, cat: '' }).MSG, /Typ šiat: neuvedené/);
    });

    it('falls back to the raw date if it is not parseable', () => {
        assert.match(buildMergePayload({ ...inquiry, date: 'nonsense' }).MSG, /Požadovaný termín: nonsense/);
    });

    it('url-encodes cleanly, diacritics and newlines included', () => {
        const body = new URLSearchParams(buildMergePayload(inquiry) as unknown as Record<string, string>);
        const parsed = new URLSearchParams(body.toString());

        assert.equal(parsed.get('FNAME'), 'Jana');
        assert.match(parsed.get('MSG') ?? '', /Nováková/);
    });
});
