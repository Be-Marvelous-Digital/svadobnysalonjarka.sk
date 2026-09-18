import { Link } from 'react-router-dom';
import { ButtonLink } from '@/components/Button';
import { COLLECTIONS } from '@/data/collections';
import { usePageMeta } from '@/hooks/usePageMeta';
import { collectionPath, ROUTES } from '@/utils/routes';
import styles from './NotFoundPage.module.less';
import { NOT_FOUND_META } from './notFoundMeta';

export const NotFoundPage = () => {
    usePageMeta(NOT_FOUND_META);

    return (
        <section className={styles.missing}>
            <div className={styles.missing__inner}>
                <span className={styles.missing__code}>404</span>
                <h1 className={styles.missing__title}>Túto stránku sme nenašli</h1>
                <p className={styles.missing__lead}>
                    Adresa buď zanikla, alebo sa do nej vlúdil preklep. Šaty aj termíny sú stále na svojom mieste.
                </p>

                <div className={styles.missing__actions}>
                    <ButtonLink to={ROUTES.home} variant="dark">
                        Späť na úvod
                    </ButtonLink>
                    <ButtonLink to={ROUTES.reservation} variant="outline">
                        Objednať termín skúšky
                    </ButtonLink>
                </div>

                <nav className={styles.missing__links} aria-label="Kolekcie">
                    {COLLECTIONS.map((collection) => (
                        <Link key={collection.key} to={collectionPath(collection.key)} className={styles.missing__link}>
                            {collection.label}
                        </Link>
                    ))}
                    <Link to={ROUTES.prices} className={styles.missing__link}>
                        Ceny
                    </Link>
                    <Link to={ROUTES.contact} className={styles.missing__link}>
                        Kontakt
                    </Link>
                </nav>
            </div>
        </section>
    );
};
