import { RevealSection } from '@/components/RevealSection';
import { imageFor, slotInfo, type SiteImages } from '@/data/siteImages';
import styles from './StorySection.module.scss';

const STATS = [
    { value: '2007', label: 'Rok založenia' },
    { value: 'Stovky', label: 'Šiat v ponuke' },
    { value: '1 : 1', label: 'Skúška len pre vás' },
];

interface StorySectionProps {
    images: SiteImages;
}

export const StorySection = ({ images }: StorySectionProps) => {
    return (
        <RevealSection className={styles.story}>
            <div className={styles.story__inner}>
                <div className={styles.story__rule}>
                    <span className={styles.story__kicker}>Salón</span>
                    <div className={styles.story__line} />
                </div>

                <div className={styles.story__grid}>
                    <div className={styles.story__copy}>
                        <p className={styles.story__lead}>
                            Od roku 2007 v Galante. Začali sme ako malá požičovňa, dnes máme stovky šiat pre nevesty, ženíchov,
                            družičky, plesovú sezónu aj prvé sväté prijímanie.
                        </p>
                        <p className={styles.story__body}>
                            Šaty neustále obmieňame a dopĺňame o najnovšie kúsky. Sme predovšetkým požičovňou, no šaty a obleky aj
                            predávame a prijímame na komisionálny predaj, výpredaj u nás preto nájdete stále.
                        </p>
                        <div className={styles.story__stats}>
                            {STATS.map((stat) => (
                                <div key={stat.label} className={styles.story__stat}>
                                    <span className={styles.story__statValue}>{stat.value}</span>
                                    <span className={styles.story__statLabel}>{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.story__frame}>
                        <img
                            src={imageFor(images, 'home.story')}
                            alt={slotInfo('home.story').alt}
                            className={styles.story__image}
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </RevealSection>
    );
};
