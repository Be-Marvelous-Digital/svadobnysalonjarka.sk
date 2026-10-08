import { FacebookIcon, InstagramIcon } from '@/components/Icon';
import { CONTACT } from '@/data/contact';
import styles from './SocialLinks.module.scss';

interface SocialLinksProps {
    className?: string;
}

export const SocialLinks = ({ className }: SocialLinksProps) => (
    <div className={className}>
        <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className={styles.link}>
            <InstagramIcon /> Instagram
        </a>
        <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" className={styles.link}>
            <FacebookIcon /> Facebook
        </a>
    </div>
);
