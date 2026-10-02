import Link from 'next/link';
import { PhoneIcon } from '@/components/Icon';
import { CONTACT } from '@/data/contact';
import { ROUTES } from '@/utils/routes';
import styles from './MobileBar.module.scss';

export const MobileBarSpacer = () => <div className={styles.spacer} />;

export const MobileBar = () => (
    <div className={styles.bar}>
        <Link href={ROUTES.reservation} className={styles.bar__cta}>
            Objednať skúšku
        </Link>
        <a href={CONTACT.phoneHref} className={styles.bar__call}>
            <PhoneIcon /> Zavolať
        </a>
    </div>
);
