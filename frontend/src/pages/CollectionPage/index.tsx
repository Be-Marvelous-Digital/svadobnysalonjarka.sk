import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ButtonAnchor, ButtonLink } from '@/components/Button';
import { CheckIcon, PhoneIcon } from '@/components/Icon';
import { Lightbox } from '@/components/Lightbox';
import { PhotoMosaic } from '@/components/PhotoMosaic';
import { COLLECTIONS, findCollection } from '@/data/collections';
import { CONTACT } from '@/data/contact';
import { photosOf, useGallery } from '@/hooks/useGallery';
import { usePageMeta } from '@/hooks/usePageMeta';
import { collectionPath, ROUTES } from '@/utils/routes';
import styles from './CollectionPage.module.less';

export const CollectionPage = () => {
    const { key } = useParams<{ key: string }>();
    const collection = findCollection(key);
    const { gallery, loading } = useGallery();
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    const closeLightbox = () => setLightboxIndex(-1);

    usePageMeta({
        title: collection ? `${collection.label} — Svadobný salón Jarka Galanta` : 'Kolekcia — Svadobný salón Jarka',
        description: collection?.description ?? '',
    });

    if (!collection) return <Navigate to={ROUTES.home} replace />;

    const photos = photosOf(gallery, collection.key);

    return (
        <section className={styles.collection}>
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
                    <PhotoMosaic sources={photos} label={collection.label} onOpen={setLightboxIndex} />
                ) : loading ? null : (
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

                <nav className={styles.collection__chips}>
                    {COLLECTIONS.map((entry) => (
                        <Link
                            key={entry.key}
                            to={collectionPath(entry.key)}
                            className={[styles.collection__chip, entry.key === 'galeria' && styles['collection__chip--accent']]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {entry.label}
                        </Link>
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

            {lightboxIndex >= 0 && photos[lightboxIndex] ? (
                <Lightbox
                    photos={photos}
                    index={lightboxIndex}
                    label={collection.label}
                    onClose={closeLightbox}
                    onNavigate={setLightboxIndex}
                />
            ) : null}
        </section>
    );
};
