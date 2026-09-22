import { ButtonLink } from '@/components/Button';
import { photosOf, useGallery } from '@/hooks/useGallery';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ROUTES } from '@/utils/routes';
import styles from './AboutPage.module.less';

const PARAGRAPHS = [
    'Salón v Galante funguje od roku 2007. Začali sme ako menšia požičovňa, postupne sme sa rozrástli a presťahovali do väčších priestorov na Vajanského ulici.',
    'Odjakživa prinášame najnovšie trendy a šaty neustále obmieňame. V ponuke máme všetko pre nevesty, ženíchov a družičky, a pripravení sme aj na plesovú sezónu či prvé sväté prijímanie.',
    'Sme najmä požičovňou, no šaty a obleky aj predávame a prijímame na komisionálny predaj.',
];

/** Shown until the osalone category has been filled in through the admin. */
const FALLBACK_PHOTOS = [
    '/assets/svadobne-4.webp',
    '/assets/svadobne-5.webp',
    '/assets/spolocenske-4.webp',
    '/assets/prijimacie-1.webp',
    '/assets/hero.webp',
];

export const AboutPage = () => {
    const { gallery } = useGallery();
    const managed = photosOf(gallery, 'osalone');
    // The first photo is the portrait beside the text and the rest fill the band
    // below it, so dragging a photo to the front in the admin promotes it.
    const [portrait = '', ...tiles] = managed.length > 0 ? managed : FALLBACK_PHOTOS;

    usePageMeta({
        title: 'O salóne — Svadobný salón Jarka Galanta',
        description: 'Svadobný salón Jarka v Galante funguje od roku 2007. Stovky šiat pre nevesty, ženíchov a družičky.',
    });

    return (
        <section className={styles.about}>
            <div className={styles.about__inner}>
                <div className={styles.about__top}>
                    <div className={styles.about__copy}>
                        <span className={styles.about__kicker}>O salóne</span>
                        <h1 className={styles.about__title}>Devätnásť rokov šiat, ktoré niekomu zmenili deň</h1>
                        {PARAGRAPHS.map((paragraph) => (
                            <p key={paragraph.slice(0, 24)} className={styles.about__body}>
                                {paragraph}
                            </p>
                        ))}
                    </div>
                    {portrait ? (
                        <div className={styles.about__portrait}>
                            <img
                                src={portrait}
                                alt="Svadobný salón Jarka v Galante"
                                className={styles.about__image}
                                loading="lazy"
                            />
                        </div>
                    ) : null}
                </div>

                {tiles.length > 0 ? (
                    <div className={styles.about__grid}>
                        {tiles.map((src, index) => (
                            <div key={src} className={styles.about__tile}>
                                <img
                                    src={src}
                                    alt={`Zo salónu Jarka v Galante, fotografia ${index + 1}`}
                                    className={styles.about__image}
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                ) : null}

                <ButtonLink to={ROUTES.reservation} variant="dark" className={styles.about__cta}>
                    Prídem sa pozrieť
                </ButtonLink>
            </div>
        </section>
    );
};
