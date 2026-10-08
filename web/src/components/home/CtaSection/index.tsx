import { ButtonLink } from '@/components/Button';
import { MailIcon, PhoneIcon } from '@/components/Icon';
import { RevealSection } from '@/components/RevealSection';
import { CONTACT } from '@/data/contact';
import { ROUTES } from '@/utils/routes';
import styles from './CtaSection.module.scss';

export const CtaSection = () => (
    <RevealSection className={styles.cta}>
        <div className={styles.cta__panel}>
            <span className={styles.cta__kicker}>Rezervácia</span>
            <h2 className={styles.cta__title}>Zajednajte si termín skúšky</h2>
            <p className={styles.cta__lead}>
                Nechajte nám kontakt a termín, ktorý vám vyhovuje. Majiteľka vám do 24 hodín zavolá alebo napíše e-mail, termín
                potvrdí alebo vám navrhne iné voľné možnosti.
            </p>
            <ButtonLink to={ROUTES.reservation} variant="dark">
                <MailIcon /> Vyplniť rezerváciu
            </ButtonLink>
            <a href={CONTACT.phoneHref} className={styles.cta__call}>
                <PhoneIcon /> alebo zavolajte {CONTACT.phone}
            </a>
        </div>
    </RevealSection>
);
