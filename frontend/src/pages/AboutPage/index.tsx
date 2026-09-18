import { ButtonLink } from '@/components/Button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ROUTES } from '@/utils/routes';
import styles from './AboutPage.module.less';

const PARAGRAPHS = [
    'Salón v Galante funguje od roku 2007. Začali sme ako menšia požičovňa, postupne sme sa rozrástli a presťahovali do väčších priestorov na Vajanského ulici.',
    'Odjakživa prinášame najnovšie trendy a šaty neustále obmieňame. V ponuke máme všetko pre nevesty, ženíchov a družičky, a pripravení sme aj na plesovú sezónu či prvé sväté prijímanie.',
    'Sme najmä požičovňou, no šaty a obleky aj predávame a prijímame na komisionálny predaj.',
];

const TILES = [
    { src: '/assets/svadobne-5.webp', alt: 'Svadobné šaty s čipkovaným korzetom zo salónu Jarka' },
    { src: '/assets/spolocenske-4.webp', alt: 'Spoločenské šaty na ples zo salónu Jarka' },
    { src: '/assets/prijimacie-1.webp', alt: 'Šaty na prvé sväté prijímanie zo salónu Jarka' },
    { src: '/assets/hero.webp', alt: 'Nevesta v svadobných šatách s dlhou vlečkou' },
];

export const AboutPage = () => {
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
                    <div className={styles.about__portrait}>
                        <img
                            src="/assets/svadobne-4.webp"
                            alt="Nevesta vo svadobných šatách v salóne Jarka v Galante"
                            className={styles.about__image}
                            loading="lazy"
                        />
                    </div>
                </div>

                <div className={styles.about__grid}>
                    {TILES.map((tile) => (
                        <div key={tile.src} className={styles.about__tile}>
                            <img src={tile.src} alt={tile.alt} className={styles.about__image} loading="lazy" />
                        </div>
                    ))}
                </div>

                <ButtonLink to={ROUTES.reservation} variant="dark" className={styles.about__cta}>
                    Prídem sa pozrieť
                </ButtonLink>
            </div>
        </section>
    );
};
