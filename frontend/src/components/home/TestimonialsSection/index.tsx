import { RevealSection } from '@/components/RevealSection';
import { SectionHeading } from '@/components/SectionHeading';
import styles from './TestimonialsSection.module.less';

const QUOTES = [
    {
        text: 'Prišla som s tým, že nič nechcem, a odchádzala som so šatami, na ktoré si dodnes všetci pamätajú. Pani Jarka má oko.',
        author: 'Lucia · Galanta',
    },
    {
        text: 'Vyskúšala som osem šiat a nikto ma nikam netlačil. Pokoj a čas, presne to som potrebovala.',
        author: 'Veronika · Šaľa',
    },
    {
        text: 'Šaty pre mňa, oblek pre manžela aj šaty pre družičky, všetko na jednom mieste a za rozumné peniaze.',
        author: 'Martina · Sereď',
    },
];

export const TestimonialsSection = () => (
    <RevealSection className={styles.testimonials}>
        <div className={styles.testimonials__inner}>
            <SectionHeading kicker="Nevesty o nás" title="Slová, ktoré nás tešia" />

            <div className={styles.testimonials__grid}>
                {QUOTES.map((quote) => (
                    <figure key={quote.author} className={styles.quote}>
                        <span className={styles.quote__mark} aria-hidden="true">
                            ”
                        </span>
                        <blockquote className={styles.quote__text}>{quote.text}</blockquote>
                        <figcaption className={styles.quote__author}>{quote.author}</figcaption>
                    </figure>
                ))}
            </div>
        </div>
    </RevealSection>
);
