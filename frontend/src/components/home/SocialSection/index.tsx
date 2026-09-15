import { RevealSection } from '@/components/RevealSection';
import { CONTACT } from '@/data/contact';
import { photosOf, useGallery } from '@/hooks/useGallery';
import styles from './SocialSection.module.less';

/** Shown until the instagram category has been filled in through the admin. */
const FALLBACK_TILES = [
    '/assets/svadobne-3.webp',
    '/assets/spolocenske-2.webp',
    '/assets/svadobne-4.webp',
    '/assets/spolocenske-3.webp',
    '/assets/svadobne-5.webp',
    '/assets/prijimacie-2.webp',
];

export const SocialSection = () => {
    const { gallery } = useGallery();
    const managed = photosOf(gallery, 'instagram');
    const tiles = managed.length > 0 ? managed : FALLBACK_TILES;

    return (
        <RevealSection className={styles.social}>
            <div className={styles.social__inner}>
                <div className={styles.social__top}>
                    <div className={styles.social__heading}>
                        <span className={styles.social__kicker}>Instagram</span>
                        <h2 className={styles.social__handle}>@svadobnysalonjarka</h2>
                    </div>
                    <div className={styles.social__links}>
                        <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">
                            Instagram
                        </a>
                        <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer">
                            Facebook
                        </a>
                    </div>
                </div>

                <div className={styles.social__grid}>
                    {tiles.map((src) => (
                        <div key={src} className={styles.social__frame}>
                            <img src={src} alt="Zo salónu Jarka" className={styles.social__image} loading="lazy" />
                        </div>
                    ))}
                </div>
            </div>
        </RevealSection>
    );
};
