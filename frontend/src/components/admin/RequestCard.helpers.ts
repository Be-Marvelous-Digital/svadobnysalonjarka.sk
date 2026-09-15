import type { Reservation } from '@/api/types';
import { CONTACT } from '@/data/contact';
import { formatLongDate, formatTimeRange } from '@/utils/date';

/** First word of the name, for the greeting. */
function firstName(name: string): string {
    return name.trim().split(/\s+/)[0] ?? '';
}

/**
 * A reply the owner can send as-is. The subject and body are filled in, so
 * confirming a fitting is one click and one send rather than retyping the date
 * out of the admin every time.
 *
 * When an alternative has already been proposed, the draft offers that instead
 * of confirming the original request.
 */
export function buildReplyMailto(reservation: Reservation, duration: number): string {
    const requested = `${formatLongDate(reservation.date)} o ${formatTimeRange(reservation.time, duration)}`;
    const greeting = firstName(reservation.name);

    const lines = reservation.altDate
        ? [
              `Dobrý deň${greeting ? `, ${greeting}` : ''},`,
              '',
              `ďakujeme za záujem o skúšku (${reservation.cat || 'šaty'}).`,
              `Vami požadovaný termín ${requested} nám, žiaľ, nevychádza.`,
              `Ponúkame náhradný termín: ${formatLongDate(reservation.altDate)} o ${reservation.altTime}.`,
              '',
              'Vyhovuje vám? Stačí odpovedať na tento e-mail.',
          ]
        : [
              `Dobrý deň${greeting ? `, ${greeting}` : ''},`,
              '',
              `ďakujeme za záujem o skúšku (${reservation.cat || 'šaty'}).`,
              `Termín ${requested} vám potvrdzujeme, tešíme sa na vás.`,
              '',
              'Ak by sa vám niečo zmenilo, dajte nám, prosím, vedieť.',
          ];

    lines.push('', 'S pozdravom', CONTACT.salonName, `${CONTACT.street}, ${CONTACT.city}`, CONTACT.phone);

    const subject = reservation.altDate
        ? 'Náhradný termín skúšky — Svadobný salón Jarka'
        : 'Potvrdenie termínu skúšky — Svadobný salón Jarka';

    // encodeURIComponent leaves the newlines alone; mail clients want them encoded.
    const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\r\n'))}`;
    return `mailto:${encodeURIComponent(reservation.email)}?${query}`;
}
