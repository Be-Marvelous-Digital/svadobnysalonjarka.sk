import { ButtonLink } from '@/components/Button';
import { RevealSection } from '@/components/RevealSection';
import { collectionPath } from '@/utils/routes';
import styles from './GroomSection.module.less';

export const GroomSection = () => (
    <RevealSection className={styles.groom}>
        <div className={styles.groom__inner}>
            <div className={styles.groom__copy}>
                <span className={styles.groom__kicker}>Pre ženíchov</span>
                <h2 className={styles.groom__title}>Oblek, ktorý stojí vedľa šiat, nie za nimi</h2>
                <p className={styles.groom__body}>
                    Obleky, vesty, kravaty, motýliky aj obuv, na požičanie i na predaj. Ženích a družbovia sa môžu obliecť v
                    jednom štýle a v jednej návšteve.
                </p>
                <ButtonLink to={collectionPath('zenich')} variant="outline-light" className={styles.groom__cta}>
                    Pozrieť ponuku
                </ButtonLink>
            </div>
            <div className={styles.groom__frame}>
                <img src="/assets/zenich-4.webp" alt="Oblek pre ženícha" className={styles.groom__image} loading="lazy" />
            </div>
        </div>
    </RevealSection>
);
