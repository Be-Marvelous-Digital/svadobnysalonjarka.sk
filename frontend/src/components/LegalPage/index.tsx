import type { ReactNode } from 'react';
import type { LegalSection } from '@/data/legal';
import { LEGAL_UPDATED } from '@/data/legal';
import styles from './LegalPage.module.less';

interface LegalPageProps {
    kicker: string;
    title: string;
    lead: string;
    sections: LegalSection[];
    footnote?: ReactNode;
}

export const LegalPage = ({ kicker, title, lead, sections, footnote }: LegalPageProps) => (
    <section className={styles.legal}>
        <div className={styles.legal__inner}>
            <div className={styles.legal__intro}>
                <span className={styles.legal__kicker}>{kicker}</span>
                <h1 className={styles.legal__title}>{title}</h1>
                <p className={styles.legal__lead}>{lead}</p>
                <span className={styles.legal__updated}>Naposledy aktualizované {LEGAL_UPDATED}</span>
            </div>

            <div className={styles.legal__body}>
                {sections.map((section) => (
                    <article key={section.heading} className={styles.legal__section}>
                        <h2 className={styles.legal__heading}>{section.heading}</h2>
                        {section.paragraphs?.map((paragraph) => (
                            <p key={paragraph.slice(0, 40)} className={styles.legal__text}>
                                {paragraph}
                            </p>
                        ))}
                        {section.bullets ? (
                            <ul className={styles.legal__list}>
                                {section.bullets.map((bullet) => (
                                    <li key={bullet.slice(0, 40)}>{bullet}</li>
                                ))}
                            </ul>
                        ) : null}
                    </article>
                ))}
            </div>

            {footnote ? <div className={styles.legal__footnote}>{footnote}</div> : null}
        </div>
    </section>
);
