import { OPENING_HOURS } from '../constants.js';
import { Reservation } from '../models/Reservation.js';

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

/** Confirmed visits and owner blocks occupy a slot; pending requests stay selectable. */
export async function busyRanges(date: string, duration: number): Promise<Array<{ start: number; end: number }>> {
    const taken = await Reservation.find({ date, status: { $in: ['confirmed', 'blocked'] } })
        .select('time')
        .lean();
    return taken.map((r) => ({ start: minutesFromTime(r.time), end: minutesFromTime(r.time) + duration }));
}

export async function freeSlots(date: string, duration: number, buffer: number): Promise<string[]> {
    const all = generateSlots(date, duration, buffer);
    if (all.length === 0) return [];
    const busy = await busyRanges(date, duration);
    return all.filter((time) => {
        const start = minutesFromTime(time);
        const end = start + duration;
        return !busy.some((b) => start < b.end && end > b.start);
    });
}

export async function isSlotFree(date: string, time: string, duration: number): Promise<boolean> {
    const start = minutesFromTime(time);
    const end = start + duration;
    const busy = await busyRanges(date, duration);
    return !busy.some((b) => start < b.end && end > b.start);
}
