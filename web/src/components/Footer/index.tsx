import Link from 'next/link';
import { ConsentSettingsButton } from '@/components/ConsentSettingsButton';
import { MailIcon, PhoneIcon, PinIcon } from '@/components/Icon';
import { SocialLinks } from '@/components/SocialLinks';
import { COLLECTIONS } from '@/data/collections';
import { CONTACT, OPENING_SUMMARY } from '@/data/contact';
import { collectionPath, ROUTES } from '@/utils/routes';
import styles from './Footer.module.scss';

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
                        <Link key={collection.key} href={collectionPath(collection.key)} className={styles.footer__link}>
                            {collection.label}
                        </Link>
                    ))}
                </div>

                <div className={styles.footer__column}>
                    <span className={styles.footer__heading}>Salón</span>
                    {SALON_LINKS.map((link) => (
                        <Link key={link.to} href={link.to} className={styles.footer__link}>
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
                    <SocialLinks className={styles.footer__social} />
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
                <nav className={styles.footer__legal} aria-label="Právne informácie">
                    <Link href={ROUTES.privacy} className={`${styles.footer__link} ${styles['footer__link--quiet']}`}>
                        Ochrana súkromia
                    </Link>
                    <Link href={ROUTES.terms} className={`${styles.footer__link} ${styles['footer__link--quiet']}`}>
                        Zásady používania
                    </Link>
                    <ConsentSettingsButton className={styles.footer__consent}>Nastavenia súkromia</ConsentSettingsButton>
                </nav>
            </div>
        </div>
    </footer>
);
