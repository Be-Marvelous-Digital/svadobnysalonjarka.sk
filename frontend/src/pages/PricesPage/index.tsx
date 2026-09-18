import { ButtonLink } from '@/components/Button';
import { MailIcon } from '@/components/Icon';
import { PRICE_CONDITIONS, PRICE_GROUPS } from '@/data/prices';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ROUTES } from '@/utils/routes';
import { PriceTable } from './PriceTable';
import styles from './PricesPage.module.less';

export const PricesPage = () => {
    usePageMeta({
        title: 'Ceny — Svadobný salón Jarka Galanta',
        description:
            'Cenník požičovného a predaja svadobných, spoločenských a prijímacích šiat, oblekov, bižutérie aj úprav na mieru.',
    });

    return (
        <section className={styles.prices}>
            <div className={styles.prices__inner}>
                <div className={styles.prices__top}>
                    <div className={styles.prices__intro}>
                        <span className={styles.prices__kicker}>Požičovné a predaj</span>
                        <h1 className={styles.prices__title}>Cenník</h1>
                        <p className={styles.prices__lead}>
                            Cena vždy závisí od konkrétneho modelu a jeho honosnosti, preto uvádzame rozpätia. Presnú cenu vám
                            radi povieme pri skúške v salóne.
                        </p>
                    </div>

                    <dl className={styles.prices__notes}>
                        {PRICE_CONDITIONS.map((note) => (
                            <div key={note.title} className={styles.prices__note}>
                                <dt className={styles.prices__noteTitle}>{note.title}</dt>
                                <dd className={styles.prices__noteBody}>{note.body}</dd>
                            </div>
                        ))}
                    </dl>

                    <div className={styles.prices__portrait}>
                        <img
                            src="/assets/svadobne-1.webp"
                            alt="Nevesta v svadobných šatách zo salónu Jarka"
                            className={styles.prices__image}
                            width={734}
                            height={1071}
                            decoding="async"
                        />
                    </div>
                </div>

                {PRICE_GROUPS.map((group) => (
                    <PriceTable key={group.title} group={group} />
                ))}

                <ButtonLink to={ROUTES.reservation} variant="dark" className={styles.prices__cta}>
                    <MailIcon /> Objednať termín skúšky
                </ButtonLink>
            </div>
        </section>
    );
};
