import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/Button';
import { CalendarIcon, DressIcon, MailIcon, PhoneIcon } from '@/components/Icon';
import { RevealSection } from '@/components/RevealSection';
import { SectionHeading } from '@/components/SectionHeading';
import { ROUTES } from '@/utils/routes';
import styles from './StepsSection.module.scss';

interface Step {
    number: string;
    icon: ReactNode;
    title: string;
    body: string;
}

const STEPS: Step[] = [
    {
        number: '01',
        icon: <CalendarIcon />,
        title: 'Vyberiete si termín',
        body: 'Vo formulári zvolíte typ šiat, dátum a čas, ktorý vám vyhovuje, a necháte nám kontakt.',
    },
    {
        number: '02',
        icon: <PhoneIcon size={18} />,
        title: 'Zavoláme vám',
        body: 'Termín nie je potvrdený automaticky. Majiteľka vás do 24 hodín kontaktuje telefonicky, termín potvrdí, alebo navrhne iné voľné dátumy a časy.',
    },
    {
        number: '03',
        icon: <DressIcon />,
        title: 'Prídete na skúšku',
        body: 'Salón je počas skúšky len váš. Vyskúšate, čo chcete, poradíme s veľkosťou, úpravou i doplnkami.',
    },
];

export const StepsSection = () => (
    <RevealSection className={styles.steps}>
        <div className={styles.steps__inner}>
            <SectionHeading kicker="Ako to prebieha" title="Tri kroky k vašim šatám" align="center" />

            <div className={styles.steps__grid}>
                {STEPS.map((step) => (
                    <div key={step.number} className={styles.step}>
                        <div className={styles.step__top}>
                            <span className={styles.step__badge}>{step.icon}</span>
                            <span className={styles.step__number}>{step.number}</span>
                        </div>
                        <h3 className={styles.step__title}>{step.title}</h3>
                        <p className={styles.step__body}>{step.body}</p>
                    </div>
                ))}
            </div>

            <div className={styles.steps__action}>
                <ButtonLink to={ROUTES.reservation} variant="dark">
                    <MailIcon /> Objednať termín skúšky
                </ButtonLink>
            </div>
        </div>
    </RevealSection>
);
