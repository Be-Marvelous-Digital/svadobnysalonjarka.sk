import { RevealSection } from '@/components/RevealSection';
import { SocialLinks } from '@/components/SocialLinks';
import styles from './SocialSection.module.scss';
import { thumbOf } from '@/utils/photos';

/** Shown until the instagram category has been filled in through the admin. */
const FALLBACK_TILES = [
    '/assets/svadobne-3.webp',
    '/assets/spolocenske-2.webp',
    '/assets/svadobne-4.webp',
    '/assets/spolocenske-3.webp',
    '/assets/svadobne-5.webp',
    '/assets/prijimacie-2.webp',
];

interface SocialSectionProps {
    photos: string[];
}

export const SocialSection = ({ photos }: SocialSectionProps) => {
    const tiles = photos.length > 0 ? photos : FALLBACK_TILES;

    return (
        <RevealSection className={styles.social}>
            <div className={styles.social__inner}>
                <div className={styles.social__top}>
                    <div className={styles.social__heading}>
                        <span className={styles.social__kicker}>Sociálne siete</span>
                        <h2 className={styles.social__handle}>@svadobnysalonjarka</h2>
                    </div>
                    <SocialLinks className={styles.social__links} />
                </div>

                <div className={styles.social__grid}>
                    {tiles.map((src, index) => (
                        <div key={src} className={styles.social__frame}>
                            <img
                                src={thumbOf(src)}
                                alt={`Šaty zo salónu Jarka na Instagrame, fotografia ${index + 1}`}
                                className={styles.social__image}
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </RevealSection>
    );
};
