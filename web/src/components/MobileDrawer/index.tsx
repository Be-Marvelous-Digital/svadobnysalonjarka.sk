'use client';

import { NavLink } from '@/components/NavLink';
import { ButtonAnchor, ButtonLink } from '@/components/Button';
import { PhoneIcon } from '@/components/Icon';
import { COLLECTIONS } from '@/data/collections';
import { CONTACT } from '@/data/contact';
import { useDialog } from '@/hooks/useDialog';
import { collectionPath, ROUTES } from '@/utils/routes';
import styles from './MobileDrawer.module.scss';

interface DrawerLink {
    to: string;
    label: string;
    // Without it "/" prefix-matches every route and Domov stays lit everywhere.
    end?: boolean;
}

const DRAWER_LINKS: DrawerLink[] = [
    { to: ROUTES.home, label: 'Domov', end: true },
    { to: collectionPath('galeria'), label: 'Galéria' },
    ...COLLECTIONS.filter((collection) => collection.key !== 'galeria').map((collection) => ({
        to: collectionPath(collection.key),
        label: collection.label,
    })),
    { to: ROUTES.prices, label: 'Ceny' },
    { to: ROUTES.venue, label: 'Svadobný priestor' },
    { to: ROUTES.about, label: 'O salóne' },
    { to: ROUTES.contact, label: 'Kontakt' },
];

interface MobileDrawerProps {
    onClose: () => void;
}

export const MobileDrawer = ({ onClose }: MobileDrawerProps) => {
    const ref = useDialog<HTMLDivElement>(onClose);

    return (
        <div ref={ref} className={styles.drawer} role="dialog" aria-modal="true" aria-label="Menu">
            <div className={styles.drawer__top}>
                <span className={styles.drawer__brand}>{CONTACT.salonName}</span>
                <button type="button" className={styles.drawer__close} onClick={onClose}>
                    Zavrieť ✕
                </button>
            </div>

            <nav className={styles.drawer__links} aria-label="Hlavné menu">
                {DRAWER_LINKS.map((link) => (
                    <NavLink key={link.to} href={link.to} end={link.end} className={styles.drawer__link} onClick={onClose}>
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className={styles.drawer__actions}>
                <ButtonLink to={ROUTES.reservation} variant="gold" block onClick={onClose}>
                    Objednať skúšku
                </ButtonLink>
                <ButtonAnchor href={CONTACT.phoneHref} variant="outline" block>
                    <PhoneIcon /> Zavolať {CONTACT.phone}
                </ButtonAnchor>
            </div>
        </div>
    );
};
