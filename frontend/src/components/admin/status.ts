import type { ReservationStatus } from '@/api/types';

export const STATUS_LABELS: Record<ReservationStatus, string> = {
    pending: 'Čaká na potvrdenie',
    confirmed: 'Potvrdené',
    rejected: 'Zamietnuté',
    blocked: 'Blokované',
};
