import { ButtonLink } from '@/components/Button';
import { RevealSection } from '@/components/RevealSection';
import { imageFor, slotInfo } from '@/data/siteImages';
import { VENUE_TEASER } from '@/data/venue';
import { useSiteImages } from '@/hooks/useSiteImages';
import { ROUTES } from '@/utils/routes';
import styles from './VenueSection.module.less';

export const VenueSection = () => {
    const images = useSiteImages();

    return (
        <RevealSection className={styles.venue}>
            <div className={styles.venue__inner}>
                <div className={styles.venue__frame}>
                    <img
                        src={imageFor(images, 'home.venue')}
                        alt={slotInfo('home.venue').alt}
                        className={styles.venue__image}
                        loading="lazy"
                    />
                </div>

                <div className={styles.venue__copy}>
                    <span className={styles.venue__kicker}>{VENUE_TEASER.kicker}</span>
                    <h2 className={styles.venue__title}>{VENUE_TEASER.title}</h2>
                    <p className={styles.venue__body}>{VENUE_TEASER.body}</p>
                    <ButtonLink to={ROUTES.venue} variant="dark" className={styles.venue__cta}>
                        {VENUE_TEASER.cta}
                    </ButtonLink>
                </div>
            </div>
        </RevealSection>
    );
};
