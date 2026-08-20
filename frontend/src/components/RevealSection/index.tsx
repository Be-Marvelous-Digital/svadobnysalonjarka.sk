import type { ReactNode } from 'react';
import { useReveal } from '@/hooks/useReveal';
import styles from './RevealSection.module.less';

interface RevealSectionProps {
    className?: string;
    children: ReactNode;
}

export const RevealSection = ({ className, children }: RevealSectionProps) => {
    const ref = useReveal<HTMLElement>();

    return (
        <section ref={ref} className={[styles.reveal, className].filter(Boolean).join(' ')}>
            {children}
        </section>
    );
};
