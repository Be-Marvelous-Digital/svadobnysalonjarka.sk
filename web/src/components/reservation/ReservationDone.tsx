import { Button, ButtonLink } from '@/components/Button';
import { CONTACT } from '@/data/contact';
import type { ReservationDraft } from '@/hooks/useReservationForm';
import { formatLongDate } from '@/utils/date';
import { ROUTES } from '@/utils/routes';
import styles from './ReservationForm.module.scss';

interface ReservationDoneProps {
    reservation: ReservationDraft;
    onReset: () => void;
}

export const ReservationDone = ({ reservation, onReset }: ReservationDoneProps) => {
    const firstName = reservation.firstName?.trim() || 'tešíme sa';

    return (
        <div className={styles.done}>
            <span className={styles.done__mark}>✓</span>
            <h2 className={styles.done__title}>Žiadosť sme prijali</h2>
            <p className={styles.done__body}>
                Ďakujeme, {firstName}. Žiadosť o termín {formatLongDate(reservation.date)} o {reservation.time} je u nás.
            </p>
            <p className={styles.done__body}>
                Termín ešte nie je potvrdený. Majiteľka vám do 24 hodín zavolá alebo napíše e-mail a termín potvrdí, prípadne vám
                navrhne iné voľné dátumy a časy. Ak sa vám niečo zmení, zavolajte na {CONTACT.phone}.
            </p>
            <div className={styles.done__actions}>
                <ButtonLink to={ROUTES.home} variant="dark" size="sm">
                    Späť na úvod
                </ButtonLink>
                <Button variant="outline" size="sm" onClick={onReset}>
                    Nová žiadosť
                </Button>
            </div>
        </div>
    );
};
