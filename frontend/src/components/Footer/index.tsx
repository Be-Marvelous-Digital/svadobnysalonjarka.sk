import { Link } from 'react-router-dom';
import { MailIcon, PhoneIcon, PinIcon } from '@/components/Icon';
import { COLLECTIONS } from '@/data/collections';
import { CONTACT, OPENING_SUMMARY } from '@/data/contact';
import { openConsentSettings } from '@/hooks/useCookieConsent';
import { collectionPath, ROUTES } from '@/utils/routes';
import styles from './Footer.module.less';

const SALON_LINKS = [
    { to: ROUTES.about, label: 'O salóne' },
    { to: ROUTES.venue, label: 'Svadobný priestor' },
    { to: ROUTES.prices, label: 'Ceny' },
    { to: collectionPath('galeria'), label: 'Galéria' },
    { to: ROUTES.reservation, label: 'Rezervácia' },
];

export const Footer = () => (
    <footer className={styles.footer}>
        <div className={styles.footer__inner}>
            <div className={styles.footer__columns}>
                <div className={styles.footer__column}>
                    <span className={styles.footer__brand}>{CONTACT.salonName}</span>
                    <p className={styles.footer__about}>
                        Svadobný a spoločenský salón v Galante. Všetko pre nevesty, ženíchov a družičky na jednom mieste, od roku
                        2007.
                    </p>
                </div>

                <div className={styles.footer__column}>
                    <span className={styles.footer__heading}>Kolekcie</span>
                    {COLLECTIONS.filter((collection) => collection.key !== 'galeria').map((collection) => (
                        <Link key={collection.key} to={collectionPath(collection.key)} className={styles.footer__link}>
                            {collection.label}
                        </Link>
                    ))}
                </div>

                <div className={styles.footer__column}>
                    <span className={styles.footer__heading}>Salón</span>
                    {SALON_LINKS.map((link) => (
                        <Link key={link.to} to={link.to} className={styles.footer__link}>
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className={styles.footer__column}>
                    <span className={styles.footer__heading}>Kontakt</span>
                    <span className={styles.footer__contactRow}>
                        <PinIcon />
                        <span>
                            {CONTACT.street}
                            <br />
                            {CONTACT.city}
                        </span>
                    </span>
                    <a href={CONTACT.phoneHref} className={styles.footer__contactRow}>
                        <PhoneIcon /> {CONTACT.phone}
                    </a>
                    <a href={`mailto:${CONTACT.email}`} className={styles.footer__contactRow}>
                        <MailIcon /> {CONTACT.email}
                    </a>
                    <div className={styles.footer__social}>
                        <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">
                            Instagram
                        </a>
                        <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer">
                            Facebook
                        </a>
                    </div>
                </div>
            </div>

            <div className={styles.footer__bottom}>
                <span>© {new Date().getFullYear()} Svadobný salón Jarka</span>
                <span>{OPENING_SUMMARY}</span>
                <span className={styles.footer__credit}>
                    Vytvorené{' '}
                    <a href="https://bemarvelousdigital.sk" target="_blank" rel="noopener noreferrer">
                        BeMarvelousDigital.sk
                    </a>
                </span>
                <nav className={styles.footer__legal}>
                    <Link to={ROUTES.privacy} className={`${styles.footer__link} ${styles['footer__link--quiet']}`}>
                        Ochrana súkromia
                    </Link>
                    <Link to={ROUTES.terms} className={`${styles.footer__link} ${styles['footer__link--quiet']}`}>
                        Zásady používania
                    </Link>
                    <button type="button" className={styles.footer__consent} onClick={openConsentSettings}>
                        Nastavenia súkromia
                    </button>
                </nav>
            </div>
        </div>
    </footer>
);
