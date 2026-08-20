import type { CategoryKey } from '@/data/collections';

export type Gallery = Record<CategoryKey, string[]>;

export type ReservationStatus = 'pending' | 'confirmed' | 'rejected' | 'blocked';
export type ReservationKind = 'klient' | 'majitelka' | 'blok';

export interface Reservation {
    id: string;
    name: string;
    phone: string;
    email: string;
    cat: string;
    note: string;
    date: string;
    time: string;
    status: ReservationStatus;
    kind: ReservationKind;
    altDate: string;
    altTime: string;
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
