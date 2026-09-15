import type { CategoryKey } from '@/data/collections';

export type Gallery = Record<CategoryKey, string[]>;

/** An inquiry from the public form. The salon agrees the date off-site. */
export interface Reservation {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    cat: string;
    date: string;
    time: string;
    handled: boolean;
    /** What the owner actually agreed, which need not be what was requested. */
    confirmedDate: string;
    confirmedTime: string;
    createdAt: string;
}

export interface WeekSlot {
    time: string;
    booked: null | { id: string; firstName: string; lastName: string; phone: string; cat: string };
}

export interface WeekDay {
    date: string;
    slots: WeekSlot[];
}

export interface Week {
    duration: number;
    days: WeekDay[];
}

export interface Availability {
    date: string;
    duration: number;
    slots: string[];
}

export interface SalonSettings {
    duration: number;
    buffer: number;
}

export interface AdminPhoto {
    id: string;
    category: CategoryKey;
    url: string;
}

export interface AdminUser {
    id: string;
    username: string;
    role: string;
    createdAt: string;
    isSelf: boolean;
}
