import { ButtonAnchor, ButtonLink } from '@/components/Button';
import { CheckIcon, PhoneIcon } from '@/components/Icon';
import { NavLink } from '@/components/NavLink';
import { PhotoGallery } from '@/components/PhotoGallery';
import { StructuredData } from '@/components/StructuredData';
import { COLLECTIONS, type Collection } from '@/data/collections';
import { CONTACT } from '@/data/contact';
import { breadcrumbSchema, collectionSchema } from '@/data/schema';
import { collectionPath, ROUTES } from '@/utils/routes';
import styles from './CollectionPage.module.scss';

interface CollectionPageProps {
    collection: Collection;
    photos: string[];
}

export const CollectionPage = ({ collection, photos }: CollectionPageProps) => {
    const trail = [
        { name: 'Domov', path: ROUTES.home },
        { name: collection.label, path: collectionPath(collection.key) },
    ];

    return (
        <section className={styles.collection}>
            <StructuredData schema={collectionSchema(collection, photos.length)} />
            <StructuredData schema={breadcrumbSchema(trail)} />
            <div className={styles.collection__inner}>
                <header className={styles.collection__header}>
                    <div className={styles.collection__intro}>
                        <span className={styles.collection__kicker}>{collection.kicker}</span>
                        <h1 className={styles.collection__title}>{collection.label}</h1>
                        <p className={styles.collection__flavor}>{collection.flavor}</p>
                        <p className={styles.collection__description}>{collection.description}</p>
                    </div>
                    <div className={styles.collection__aside}>
                        <span className={styles.collection__count}>
                            {photos.length > 0 ? `${photos.length} fotografií` : 'Fotografie pripravujeme'}
                        </span>
                        <ButtonLink to={ROUTES.reservation} variant="dark" size="sm">
                            Objednať skúšku
                        </ButtonLink>
                    </div>
                </header>

                <div className={styles.collection__facts}>
                    {collection.facts.map((fact) => (
                        <div key={fact} className={styles.collection__fact}>
                            <span className={styles.collection__factMark}>
                                <CheckIcon />
                            </span>
                            <span className={styles.collection__factText}>{fact}</span>
                        </div>
                    ))}
                </div>

                {photos.length > 0 ? (
                    <PhotoGallery photos={photos} label={collection.label} ratio={collection.tileRatio} />
                ) : (
                    <div className={styles.collection__empty}>
                        <span className={styles.collection__emptyTag}>fotografie pripravujeme</span>
                        <p className={styles.collection__emptyText}>
                            Túto kolekciu práve fotíme. Rada vám ju ukážem naživo v salóne, stačí si zajednať termín.
                        </p>
                        <ButtonLink to={ROUTES.reservation} variant="dark" size="sm">
                            Objednať skúšku
                        </ButtonLink>
                    </div>
                )}

                <nav className={styles.collection__chips} aria-label="Ďalšie kolekcie">
                    {COLLECTIONS.map((entry) => (
                        <NavLink key={entry.key} href={collectionPath(entry.key)} className={styles.collection__chip}>
                            {entry.label}
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.banner}>
                    <div className={styles.banner__glow} />
                    <div className={styles.banner__copy}>
                        <span className={styles.banner__kicker}>Páči sa vám niektorý model?</span>
                        <span className={styles.banner__title}>Zajednajte si termín skúšky ešte dnes</span>
                        <span className={styles.banner__note}>Odpovieme do 24 hodín a potvrdíme presný čas návštevy.</span>
                    </div>
                    <div className={styles.banner__actions}>
                        <ButtonLink to={ROUTES.reservation} variant="gold">
                            Objednať skúšku
                        </ButtonLink>
                        <ButtonAnchor href={CONTACT.phoneHref} variant="outline-light">
                            <PhoneIcon /> {CONTACT.phone}
                        </ButtonAnchor>
                    </div>
                </div>
            </div>
        </section>
    );
};
