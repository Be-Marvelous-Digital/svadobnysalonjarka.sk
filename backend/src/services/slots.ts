import { OPENING_HOURS } from '../constants.js';

export function minutesFromTime(time: string): number {
    const [h, m] = time.split(':');
    return Number.parseInt(h ?? '0', 10) * 60 + Number.parseInt(m ?? '0', 10);
}

export function timeFromMinutes(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m < 10 ? `0${m}` : m}`;
}

export function weekdayOf(date: string): number {
    return new Date(`${date}T12:00:00Z`).getUTCDay();
}

export function generateSlots(date: string, duration: number, buffer: number): string[] {
    const hours = OPENING_HOURS[weekdayOf(date)];
    if (!hours) return [];
    const step = duration + buffer;
    const slots: string[] = [];
    for (let t = hours[0] * 60; t + duration <= hours[1] * 60; t += step) slots.push(timeFromMinutes(t));
    return slots;
}

/**
 * What the salon opens for on a given day. Existing inquiries are deliberately
 * ignored: nothing is approved here, so a request is only a request, and two
 * people asking about the same time is a phone call to make, not a clash to
 * prevent. Blocking on it would hide free time from everyone but the first
 * person to ask.
 */
export function offeredSlots(date: string, duration: number, buffer: number): string[] {
    return generateSlots(date, duration, buffer);
}
