import type { Reservation } from '@/api/types';
import { CONTACT } from '@/data/contact';
import { formatLongDate } from '@/utils/date';

/** First word of the name, for the greeting. */
function firstName(name: string): string {
    return name.trim().split(/\s+/)[0] ?? '';
}

/**
 * A reply the owner can send as-is. The date and time the client asked for are
 * already in the body, so answering an inquiry is one click and one send rather
 * than retyping it out of the admin.
 *
 * Nothing here confirms anything on the server: the salon agrees the date with
 * the client directly, by phone or in this reply.
 */
export function buildReplyMailto(inquiry: Reservation): string {
    const greeting = firstName(inquiry.name);

    const lines = [
        `Dobrý deň${greeting ? `, ${greeting}` : ''},`,
        '',
        `ďakujeme za váš dopyt (${inquiry.cat || 'šaty'}).`,
        `Termín ${formatLongDate(inquiry.date)} o ${inquiry.time} vám vieme potvrdiť, tešíme sa na vás.`,
        '',
        'Ak by vám medzičasom vyhovoval iný čas, dajte nám, prosím, vedieť.',
        '',
        'S pozdravom',
        CONTACT.salonName,
        `${CONTACT.street}, ${CONTACT.city}`,
        CONTACT.phone,
    ];

    const subject = 'Váš dopyt na skúšku — Svadobný salón Jarka';
    // encodeURIComponent leaves newlines alone; mail clients want them encoded.
    const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\r\n'))}`;
    return `mailto:${encodeURIComponent(inquiry.email)}?${query}`;
}
