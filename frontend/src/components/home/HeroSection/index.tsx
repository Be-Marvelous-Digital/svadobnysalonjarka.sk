import { ButtonLink } from '@/components/Button';
import { MailIcon } from '@/components/Icon';
import { collectionPath, ROUTES } from '@/utils/routes';
import styles from './HeroSection.module.less';

export const HeroSection = () => (
    <section className={styles.hero}>
        <div className={styles.hero__image} />
        <div className={styles.hero__scrim} />
        <div className={styles.hero__vignette} />
        <div className={styles.hero__copy} data-over-media="true">
            <span className={styles.hero__kicker}>Svadobný salón · Galanta</span>
            <h1 className={styles.hero__title}>
                Šaty, v ktorých
                <br />
                vás poznajú znova
            </h1>
            <p className={styles.hero__lead}>
                Skúšku venujeme len vám, v pokojnej atmosfére a bez zhonu. Nájdeme spolu šaty, v ktorých sa vo Váš výnimočný deň
                budete cítiť naozaj sama sebou.
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
