import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ButtonAnchor, ButtonLink } from '@/components/Button';
import { PhoneIcon } from '@/components/Icon';
import { COLLECTIONS } from '@/data/collections';
import { CONTACT } from '@/data/contact';
import { collectionPath, ROUTES } from '@/utils/routes';
import styles from './MobileDrawer.module.less';

interface MobileDrawerProps {
    onClose: () => void;
}

export const MobileDrawer = ({ onClose }: MobileDrawerProps) => {
    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, []);

    return (
        <div className={styles.drawer}>
            <div className={styles.drawer__top}>
                <span className={styles.drawer__brand}>{CONTACT.salonName}</span>
                <button type="button" className={styles.drawer__close} onClick={onClose}>
                    Zavrieť ✕
                </button>
            </div>

            <nav className={styles.drawer__links}>
                <Link to={ROUTES.home} className={styles.drawer__link} onClick={onClose}>
                    Domov
                </Link>
                <Link
                    to={collectionPath('galeria')}
                    className={`${styles.drawer__link} ${styles['drawer__link--accent']}`}
                    onClick={onClose}
                >
                    Galéria
                </Link>
                {COLLECTIONS.filter((collection) => collection.key !== 'galeria').map((collection) => (
                    <Link
                        key={collection.key}
                        to={collectionPath(collection.key)}
                        className={styles.drawer__link}
                        onClick={onClose}
                    >
                        {collection.label}
                    </Link>
                ))}
                <Link to={ROUTES.prices} className={styles.drawer__link} onClick={onClose}>
                    Ceny
                </Link>
                <Link to={ROUTES.about} className={styles.drawer__link} onClick={onClose}>
                    O salóne
                </Link>
                <Link to={ROUTES.contact} className={styles.drawer__link} onClick={onClose}>
                    Kontakt
                </Link>
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
