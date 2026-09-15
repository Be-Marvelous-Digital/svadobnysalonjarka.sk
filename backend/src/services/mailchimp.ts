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
 * Sends the inquiry to the Mailchimp audience.
 *
 * Deliberately never throws and never blocks the caller's response: the booking
 * is what matters, and Mailchimp being slow or down must not cost the salon a
 * client. Failures are logged and dropped.
 */
export async function forwardInquiry(inquiry: InquiryFields): Promise<void> {
    if (!env.MAILCHIMP_SUBSCRIBE_URL) return;

    const body = new URLSearchParams(buildMergePayload(inquiry) as unknown as Record<string, string>);

    try {
        const response = await fetch(env.MAILCHIMP_SUBSCRIBE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
            signal: AbortSignal.timeout(env.MAILCHIMP_TIMEOUT_MS),
        });

        if (!response.ok) {
            logger.warn({ status: response.status }, 'Mailchimp rejected the inquiry');
            return;
        }
        logger.info('Inquiry forwarded to Mailchimp');
    } catch (error) {
        logger.warn({ error }, 'Could not forward the inquiry to Mailchimp');
    }
}
