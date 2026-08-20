import { Link } from 'react-router-dom';
import { RevealSection } from '@/components/RevealSection';
import { SectionHeading } from '@/components/SectionHeading';
import { BOOKABLE_COLLECTIONS } from '@/data/collections';
import { collectionPath, ROUTES } from '@/utils/routes';
import styles from './CollectionsSection.module.less';

export const CollectionsSection = () => (
    <RevealSection className={styles.collections}>
        <div className={styles.collections__inner}>
            <div className={styles.collections__top}>
                <SectionHeading kicker="Kolekcie" title="Čo u nás nájdete" />
                <Link to={ROUTES.reservation} className={styles.collections__more}>
                    Chcem skúšku →
                </Link>
            </div>

            <div className={styles.collections__grid}>
                {BOOKABLE_COLLECTIONS.map((collection) => (
                    <Link key={collection.key} to={collectionPath(collection.key)} className={styles.card}>
                        <div className={styles.card__frame}>
                            <img src={collection.cover} alt={collection.label} className={styles.card__image} loading="lazy" />
                        </div>
                        <div className={styles.card__text}>
                            <span className={styles.card__title}>{collection.label}</span>
                            <span className={styles.card__teaser}>{collection.teaser}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    </RevealSection>
);
