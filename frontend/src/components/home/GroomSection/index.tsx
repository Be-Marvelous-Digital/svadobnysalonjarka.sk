import { ButtonLink } from '@/components/Button';
import { RevealSection } from '@/components/RevealSection';
import { imageFor, slotInfo } from '@/data/siteImages';
import { useSiteImages } from '@/hooks/useSiteImages';
import { collectionPath } from '@/utils/routes';
import styles from './GroomSection.module.less';

export const GroomSection = () => {
    const images = useSiteImages();

    return (
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
                    <img
                        src={imageFor(images, 'home.groom')}
                        alt={slotInfo('home.groom').alt}
                        className={styles.groom__image}
                        loading="lazy"
                    />
                </div>
            </div>
        </RevealSection>
    );
};
