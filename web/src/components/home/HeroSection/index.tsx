import { ButtonLink } from '@/components/Button';
import { MailIcon } from '@/components/Icon';
import { collectionPath, ROUTES } from '@/utils/routes';
import styles from './HeroSection.module.scss';

export const HeroSection = () => (
    <section className={styles.hero}>
        <div className={styles.hero__image} />
        <div className={styles.hero__scrim} />
        <div className={styles.hero__vignette} />
        <div className={styles.hero__copy} data-over-media="true">
            <span className={styles.hero__kicker}>Svadobný salón v Galante · od roku 2007</span>
            <h1 className={styles.hero__title}>
                Šaty, v ktorých
                <br />
                poviete áno
            </h1>
            <p className={styles.hero__lead}>
                Svadobné a spoločenské šaty aj obleky pre ženíchov, na požičanie aj na predaj. Na skúške máte salón len pre seba,
                aby ste si v pokoji a bez zhonu našli tie pravé.
            </p>
            <div className={styles.hero__actions}>
                <ButtonLink to={ROUTES.reservation} variant="light">
                    <MailIcon /> Objednať termín skúšky
                </ButtonLink>
                <ButtonLink to={collectionPath('svadobne')} variant="outline-light">
                    Prezrieť kolekcie
                </ButtonLink>
            </div>
        </div>
    </section>
);
