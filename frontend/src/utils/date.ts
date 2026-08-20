const DAYS = ['Nedeľa', 'Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota'];
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

/** Parses a YYYY-MM-DD day at midday so a timezone shift can never move it to the neighbouring day. */
function parseDay(date: string): Date {
    return new Date(`${date}T12:00:00`);
}

export function toDateKey(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

export function todayKey(): string {
    return toDateKey(new Date());
}

export function formatLongDate(date: string): string {
    if (!date) return '';
    const parsed = parseDay(date);
    return `${DAYS[parsed.getDay()]} ${parsed.getDate()}. ${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`;
}

export function weekdayShort(date: string): string {
    return (DAYS[parseDay(date).getDay()] ?? '').slice(0, 2);
}

export function dayNumber(date: string): string {
    return String(parseDay(date).getDate());
}

export function addDays(date: Date, days: number): Date {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
}

export function minutesFromTime(time: string): number {
    const [hours, minutes] = time.split(':');
    return Number.parseInt(hours ?? '0', 10) * 60 + Number.parseInt(minutes ?? '0', 10);
}

export function timeFromMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return `${hours}:${rest < 10 ? `0${rest}` : rest}`;
}

export function formatTimeRange(time: string, duration: number): string {
    return `${time} – ${timeFromMinutes(minutesFromTime(time) + duration)}`;
}
