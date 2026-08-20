import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiGet, apiSend } from '@/api/client';
import type { Reservation, ReservationStatus, SalonSettings } from '@/api/types';

interface DaySlot {
    time: string;
    reservation: null | {
        id: string;
        name: string;
        note: string;
        status: ReservationStatus;
        kind: string;
    };
}

interface DaySchedule {
    date: string;
    duration: number;
    slots: DaySlot[];
}

export interface OwnerReservationInput {
    name: string;
    phone?: string;
    email?: string;
    cat?: string;
    note?: string;
    date: string;
    time: string;
    kind: 'majitelka' | 'blok';
}

export function useAdminData(day: string) {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [settings, setSettings] = useState<SalonSettings>({ duration: 60, buffer: 15 });
    const [schedule, setSchedule] = useState<DaySchedule | null>(null);
    const [error, setError] = useState('');

    const loadReservations = useCallback(async () => {
        setReservations(await apiGet<Reservation[]>('/admin/reservations'));
    }, []);

    const loadSchedule = useCallback(async () => {
        if (!day) return;
        setSchedule(await apiGet<DaySchedule>(`/admin/day?date=${encodeURIComponent(day)}`));
    }, [day]);

    const refresh = useCallback(async () => {
        try {
            await Promise.all([loadReservations(), loadSchedule()]);
            setError('');
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : 'Údaje sa nepodarilo načítať.');
        }
    }, [loadReservations, loadSchedule]);

    useEffect(() => {
        apiGet<SalonSettings>('/admin/settings')
            .then(setSettings)
            .catch(() => undefined);
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const run = useCallback(
        async (action: () => Promise<unknown>) => {
            try {
                await action();
                setError('');
                await refresh();
            } catch (caught) {
                setError(caught instanceof ApiError ? caught.message : 'Zmenu sa nepodarilo uložiť.');
            }
        },
        [refresh],
    );

    const saveSettings = useCallback(
        (next: SalonSettings) =>
            run(async () => {
                await apiSend('PUT', '/admin/settings', next);
                setSettings(next);
            }),
        [run],
    );

    const patchReservation = useCallback(
        (id: string, changes: Partial<Pick<Reservation, 'status' | 'altDate' | 'altTime'>>) =>
            run(() => apiSend('PATCH', `/admin/reservations/${id}`, changes)),
        [run],
    );

    const removeReservation = useCallback((id: string) => run(() => apiSend('DELETE', `/admin/reservations/${id}`)), [run]);

    const createReservation = useCallback(
        (input: OwnerReservationInput) => run(() => apiSend('POST', '/admin/reservations', input)),
        [run],
    );

    return { reservations, settings, schedule, error, saveSettings, patchReservation, removeReservation, createReservation };
}
