import { env } from '../env.js';
import { logger } from '../logger.js';

export interface InquiryFields {
    name: string;
    phone: string;
    email: string;
    cat: string;
    date: string;
    time: string;
}

/** Mailchimp merge tags, as configured on the audience. */
export interface MergePayload {
    EMAIL: string;
    FNAME: string;
    PHONE: string;
    MSG: string;
    REQDATE: string;
}

const MONTHS = [
    'januára',
    'februára',
    'marca',
    'apríla',
    'mája',
    'júna',
    'júla',
    'augusta',
    'septembra',
    'októbra',
    'novembra',
    'decembra',
];

/** "2027-03-10" as "10. marca 2027", for the human-readable MSG body. */
function readableDate(date: string): string {
    const [year, month, day] = date.split('-');
    const index = Number(month) - 1;
    if (!year || !day || !MONTHS[index]) return date;
    return `${Number(day)}. ${MONTHS[index]} ${year}`;
}

/**
 * The reservation form collects a full name, but FNAME is a first-name field.
 * Stuffing the whole name in there would make every Mailchimp greeting read
 * wrong, so the surname travels in MSG instead, where nothing interpolates it.
 */
export function buildMergePayload(inquiry: InquiryFields): MergePayload {
    const [firstName = '', ...rest] = inquiry.name.trim().split(/\s+/);
    const surname = rest.join(' ');

    const lines = [
        `${inquiry.name} má záujem o termín skúšky.`,
        '',
        `Typ šiat: ${inquiry.cat || 'neuvedené'}`,
        `Požadovaný termín: ${readableDate(inquiry.date)} o ${inquiry.time}`,
        `Telefón: ${inquiry.phone}`,
        `E-mail: ${inquiry.email}`,
        ...(surname ? [`Priezvisko: ${surname}`] : []),
    ];

    return {
        EMAIL: inquiry.email,
        FNAME: firstName,
        PHONE: inquiry.phone,
        MSG: lines.join('\n'),
        // ISO 8601: unambiguous whichever way the Mailchimp date field is set to
        // display it, unlike a DD/MM or MM/DD guess.
        REQDATE: inquiry.date,
    };
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
