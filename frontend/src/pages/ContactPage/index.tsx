import { ButtonLink } from '@/components/Button';
import { ConsentMap } from '@/components/ConsentMap';
import { PhoneIcon } from '@/components/Icon';
import { CONTACT, OPENING_ROWS } from '@/data/contact';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ROUTES } from '@/utils/routes';
import styles from './ContactPage.module.less';

export const ContactPage = () => {
    usePageMeta({
        title: 'Kontakt — Svadobný salón Jarka Galanta',
        description: `Svadobný salón Jarka, ${CONTACT.street}, ${CONTACT.city}. Telefón ${CONTACT.phone}, otváracie hodiny a mapa.`,
    });

    return (
        <section className={styles.contact}>
            <div className={styles.contact__inner}>
                <div className={styles.contact__intro}>
                    <span className={styles.contact__kicker}>Kontakt</span>
                    <h1 className={styles.contact__title}>Nájdete nás v Galante</h1>
                </div>

                <div className={styles.contact__grid}>
                    <div className={styles.contact__details}>
                        <div className={styles.contact__block}>
                            <span className={styles.contact__label}>Adresa</span>
                            <span className={styles.contact__value}>
                                {CONTACT.street}
                                <br />
                                {CONTACT.city}
                            </span>
                        </div>

                        <div className={styles.contact__block}>
                            <span className={styles.contact__label}>Telefón</span>
                            <a href={CONTACT.phoneHref} className={styles.contact__value}>
                                <PhoneIcon size={20} /> {CONTACT.phone}
                            </a>
                        </div>

                        <div className={styles.contact__block}>
                            <span className={styles.contact__label}>E-mail</span>
                            <a
                                href={`mailto:${CONTACT.email}`}
                                className={`${styles.contact__value} ${styles['contact__value--email']}`}
                            >
                                {CONTACT.email}
                            </a>
                        </div>

                        <div className={styles.contact__block}>
                            <span className={styles.contact__label}>Otváracie hodiny</span>
                            <div className={styles.contact__hours}>
                                {OPENING_ROWS.map((row) => (
                                    <div key={row.day} className={styles.contact__hoursRow}>
                                        <span>{row.day}</span>
                                        <span
                                            className={[
                                                styles.contact__hoursValue,
                                                row.closed && styles['contact__hoursValue--closed'],
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                        >
                                            {row.hours}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className={styles.contact__hint}>
                                Skúšku odporúčame vopred zajednať, aby sme sa vám mohli venovať len my a vy.
                            </p>
                        </div>

                        <ButtonLink to={ROUTES.reservation} variant="dark" size="sm" className={styles.contact__cta}>
                            Objednať termín
                        </ButtonLink>
                    </div>

                    <div className={styles.contact__mapWrap}>
                        <ConsentMap />
                        <a href={CONTACT.mapLink} target="_blank" rel="noopener noreferrer" className={styles.contact__mapLink}>
                            Otvoriť v Google Mapách ↗
                        </a>
                        <div className={styles.contact__social}>
                            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">
                                Instagram
                            </a>
                            <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer">
                                Facebook
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
