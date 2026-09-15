import { createHash } from 'node:crypto';
import { env } from '../env.js';
import { logger } from '../logger.js';

export interface InquiryFields {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    cat: string;
    date: string;
    time: string;
}

/**
 * Mailchimp accepts a merge field under its tag name (FNAME) or its positional
 * alias (MERGE1), and which one the endpoint wants depends on how the form was
 * generated: the hosted page at /subscribe uses MERGE indices, the classic embed
 * snippet uses tag names. Sending both costs nothing and unknown keys are
 * ignored, so the payload does not depend on guessing right.
 *
 * A field is only stored if it has been added to the signup form in Mailchimp.
 * Existing on the audience is not enough — anything not on the form is dropped.
 */
export type MergePayload = Record<string, string>;

/** Positional aliases for the fields Mailchimp creates on every audience. */
const ALIASES: Record<string, string> = {
    EMAIL: 'MERGE0',
    FNAME: 'MERGE1',
    LNAME: 'MERGE2',
    PHONE: 'MERGE4',
};

export function buildMergePayload(inquiry: InquiryFields): MergePayload {
    const byTag: Record<string, string> = {
        EMAIL: inquiry.email,
        FNAME: inquiry.firstName,
        LNAME: inquiry.lastName,
        PHONE: inquiry.phone,
        TYPE: inquiry.cat,
        // ISO 8601 and 24h: unambiguous whichever way the Mailchimp fields are set
        // to display them, unlike a DD/MM or MM/DD guess.
        REQDATE: inquiry.date,
        REQTIME: inquiry.time,
    };

    const payload: MergePayload = { ...byTag };
    for (const [tag, alias] of Object.entries(ALIASES)) {
        const value = byTag[tag];
        if (value !== undefined) payload[alias] = value;
    }
    return payload;
}

/**
 * Turns whatever was pasted into the endpoint that reports failures.
 *
 * Two traps, both of which answer HTTP 200 and look like success:
 *  - a URL copied from a browser or an HTML snippet carries `&amp;`, so Mailchimp
 *    reads the audience parameter as `amp;id`, finds no audience, and discards
 *    the submission;
 *  - `/subscribe/post` always returns an HTML page, and `/subscribe/post-json`
 *    only returns JSON when a callback name is present.
 */
export function reportingEndpoint(raw: string): string {
    const url = new URL(raw.replace(/&amp;/g, '&'));
    url.pathname = url.pathname.replace(/\/post(-json)?$/, '/post-json');
    url.searchParams.set('c', 'cb');
    return url.toString();
}

/** Mailchimp addresses a member by the md5 of their lowercased e-mail. */
function subscriberHash(email: string): string {
    return createHash('md5').update(email.trim().toLowerCase()).digest('hex');
}

/**
 * Upserts the contact through the Marketing API, which reports what it actually
 * stored. Returns false when the API is not configured so the caller can fall
 * back to the form endpoint.
 */
async function forwardViaApi(inquiry: InquiryFields): Promise<boolean> {
    const key = env.MAILCHIMP_API_KEY;
    const audience = env.MAILCHIMP_AUDIENCE_ID;
    if (!key || !audience) return false;

    const prefix = key.split('-')[1];
    const url = `https://${prefix}.api.mailchimp.com/3.0/lists/${audience}/members/${subscriberHash(inquiry.email)}`;
    const { EMAIL: _ignored, ...merge } = buildMergePayload(inquiry);

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`anystring:${key}`).toString('base64')}`,
            },
            body: JSON.stringify({
                email_address: inquiry.email,
                status_if_new: 'subscribed',
                merge_fields: merge,
            }),
            signal: AbortSignal.timeout(env.MAILCHIMP_TIMEOUT_MS),
        });

        const body = (await response.json().catch(() => ({}))) as {
            status?: string;
            detail?: string;
            errors?: Array<{ field: string; message: string }>;
            merge_fields?: Record<string, unknown>;
        };

        if (!response.ok) {
            logger.warn(
                { status: response.status, detail: body.detail, errors: body.errors },
                'Mailchimp API refused the inquiry',
            );
            return true;
        }

        // Echoing what came back is the whole point: it is the only way to see
        // which merge fields the audience actually kept.
        logger.info({ memberStatus: body.status, stored: body.merge_fields }, 'Inquiry stored in Mailchimp');
        return true;
    } catch (error) {
        logger.warn({ error }, 'Could not reach the Mailchimp API');
        return true;
    }
}

/** The JSONP-ish body the form endpoint returns, reduced to result and message. */
export function parseFormResponse(raw: string): { result: string; message: string } {
    const json = raw
        .trim()
        .replace(/^[^(]*\(/, '')
        .replace(/\);?$/, '');
    try {
        const parsed = JSON.parse(json) as { result?: string; msg?: string };
        const message = (parsed.msg ?? '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return { result: parsed.result ?? 'unknown', message };
    } catch {
        return { result: 'unknown', message: raw.slice(0, 200) };
    }
}

/**
 * Sends the inquiry to the Mailchimp audience.
 *
 * Deliberately never throws and never blocks the caller's response: the booking
 * is what matters, and Mailchimp being slow or down must not cost the salon a
 * client. Failures are logged and dropped.
 */
export async function forwardInquiry(inquiry: InquiryFields): Promise<void> {
    if (await forwardViaApi(inquiry)) return;

    if (!env.MAILCHIMP_SUBSCRIBE_URL) {
        // Silence here used to look identical to a working forward, which cost a
        // long time to diagnose. Say it out loud instead.
        logger.warn('MAILCHIMP_SUBSCRIBE_URL is not set — the inquiry was saved but not forwarded');
        return;
    }

    const body = new URLSearchParams(buildMergePayload(inquiry) as unknown as Record<string, string>);

    const endpoint = reportingEndpoint(env.MAILCHIMP_SUBSCRIBE_URL);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
            signal: AbortSignal.timeout(env.MAILCHIMP_TIMEOUT_MS),
        });

        if (!response.ok) {
            logger.warn({ status: response.status }, 'Mailchimp rejected the inquiry');
            return;
        }

        const outcome = parseFormResponse(await response.text());
        if (outcome.result === 'error') {
            logger.warn({ reason: outcome.message }, 'Mailchimp refused the inquiry');
            return;
        }
        logger.info({ message: outcome.message }, 'Inquiry forwarded to Mailchimp');
    } catch (error) {
        logger.warn({ error }, 'Could not forward the inquiry to Mailchimp');
    }
}
