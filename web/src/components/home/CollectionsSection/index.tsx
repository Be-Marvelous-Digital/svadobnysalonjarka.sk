import Link from 'next/link';
import { RevealSection } from '@/components/RevealSection';
import { SectionHeading } from '@/components/SectionHeading';
import { BOOKABLE_COLLECTIONS } from '@/data/collections';
import { coverFor, type SiteImages } from '@/data/siteImages';
import { collectionPath, ROUTES } from '@/utils/routes';
import styles from './CollectionsSection.module.scss';

interface CollectionsSectionProps {
    images: SiteImages;
}

export const CollectionsSection = ({ images }: CollectionsSectionProps) => {
    return (
        <RevealSection className={styles.collections}>
            <div className={styles.collections__inner}>
                <div className={styles.collections__top}>
                    <SectionHeading kicker="Kolekcie" title="Čo u nás nájdete" />
                    <Link href={ROUTES.reservation} className={styles.collections__more}>
                        Chcem skúšku →
                    </Link>
                </div>

                <div className={styles.collections__grid}>
                    {BOOKABLE_COLLECTIONS.map((collection) => (
                        <Link key={collection.key} href={collectionPath(collection.key)} className={styles.card}>
                            <div className={styles.card__frame}>
                                <img
                                    src={coverFor(images, collection.key)}
                                    alt={collection.label}
                                    className={styles.card__image}
                                    loading="lazy"
                                />
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
};
