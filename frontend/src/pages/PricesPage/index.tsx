import { Fragment } from 'react';
import { ButtonLink } from '@/components/Button';
import { MailIcon } from '@/components/Icon';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ROUTES } from '@/utils/routes';
import styles from './PricesPage.module.less';

const PRICE_ROWS = [
    { name: 'Svadobné šaty, požičanie', note: 'vrátane spodničky a základnej úpravy', price: 'od 180 €' },
    { name: 'Svadobné šaty, predaj', note: 'nové aj komisionálne modely', price: 'od 290 €' },
    { name: 'Spoločenské a plesové šaty', note: 'požičanie na 3 dni', price: 'od 45 €' },
    { name: 'Prijímacie šaty', note: 'požičanie, vrátane doplnkov', price: 'od 35 €' },
    { name: 'Oblek pre ženícha', note: 'sako, nohavice, vesta, kravata', price: 'od 90 €' },
    { name: 'Obuv a kabelky', note: 'k požičaným šatám zvýhodnene', price: 'od 15 €' },
];

const NOTES = [
    {
        title: 'V cene',
        body: 'Skúška bez časového limitu, poradenstvo, základná úprava na miery a čistenie po vrátení.',
    },
    { title: 'Záloha', body: 'Termín rezervujeme po zložení zálohy, ktorá sa odpočíta z celkovej ceny.' },
    { title: 'Výpredaj', body: 'Šaty aj obleky pravidelne obmieňame, zvýhodnené kúsky máme v salóne stále.' },
];

export const PricesPage = () => {
    usePageMeta({
        title: 'Ceny — Svadobný salón Jarka Galanta',
        description:
            'Orientačné ceny požičania a predaja svadobných, spoločenských a prijímacích šiat, obleku pre ženícha aj doplnkov.',
    });

    return (
        <section className={styles.prices}>
            <div className={styles.prices__inner}>
                <div className={styles.prices__intro}>
                    <span className={styles.prices__kicker}>Ceny</span>
                    <h1 className={styles.prices__title}>Orientačné ceny</h1>
                    <p className={styles.prices__lead}>
                        Cena závisí od konkrétneho modelu, sezóny a dĺžky požičania. Presnú cenu vám radi povieme pri skúške,
                        nižšie sú orientačné rozpätia.
                    </p>
                </div>

                <div className={styles.prices__table}>
                    {PRICE_ROWS.map((row) => (
                        <Fragment key={row.name}>
                            <div className={styles.prices__item}>
                                <span className={styles.prices__itemName}>{row.name}</span>
                                <span className={styles.prices__itemNote}>{row.note}</span>
                            </div>
                            <div className={styles.prices__price}>{row.price}</div>
                        </Fragment>
                    ))}
                </div>

                <div className={styles.prices__notes}>
                    {NOTES.map((note) => (
                        <div key={note.title} className={styles.prices__note}>
                            <span className={styles.prices__noteTitle}>{note.title}</span>
                            <p className={styles.prices__noteBody}>{note.body}</p>
                        </div>
                    ))}
                </div>

                <ButtonLink to={ROUTES.reservation} variant="dark" className={styles.prices__cta}>
                    <MailIcon /> Objednať termín skúšky
                </ButtonLink>
            </div>
        </section>
    );
};
