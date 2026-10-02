import type { ElementType, ReactNode } from 'react';
import styles from './SectionHeading.module.scss';

interface SectionHeadingProps {
    kicker: string;
    title: ReactNode;
    lead?: ReactNode;
    align?: 'left' | 'center';
    as?: ElementType;
}

export const SectionHeading = ({ kicker, title, lead, align = 'left', as: Title = 'h2' }: SectionHeadingProps) => (
    <div className={[styles.heading, align === 'center' && styles['heading--center']].filter(Boolean).join(' ')}>
        <span className={styles.heading__kicker}>{kicker}</span>
        <Title className={styles.heading__title}>{title}</Title>
        {lead ? <p className={styles.heading__lead}>{lead}</p> : null}
    </div>
);
