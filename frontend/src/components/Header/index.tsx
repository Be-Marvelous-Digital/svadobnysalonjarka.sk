import { useCallback, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ButtonLink } from '@/components/Button';
import { COLLECTIONS } from '@/data/collections';
import { CONTACT } from '@/data/contact';
import { collectionPath, ROUTES } from '@/utils/routes';
import styles from './Header.module.less';

interface HeaderProps {
    transparent: boolean;
    hidden: boolean;
    drawerOpen: boolean;
    onOpenDrawer: () => void;
}

export const Header = ({ transparent, hidden, drawerOpen, onOpenDrawer }: HeaderProps) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const openMenu = useCallback(() => setMenuOpen(true), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);
    const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);

    const className = [styles.header, transparent && styles['header--transparent'], hidden && styles['header--hidden']]
        .filter(Boolean)
        .join(' ');

    return (
        <header className={className} data-over-media={transparent || undefined}>
            <div className={styles.header__inner}>
                <Link to={ROUTES.home} className={styles.header__brand}>
                    <span className={styles.header__brandName}>{CONTACT.salonName}</span>
                    <span className={styles.header__brandNote}>{CONTACT.tagline}</span>
                </Link>

                <nav className={styles.header__nav} aria-label="Hlavné menu">
                    <NavLink to={ROUTES.home} end className={styles.header__link}>
                        Domov
                    </NavLink>

                    <div className={styles.header__dropdown} onMouseEnter={openMenu} onMouseLeave={closeMenu}>
                        <button
                            type="button"
                            className={styles.header__dropdownToggle}
                            onClick={toggleMenu}
                            aria-expanded={menuOpen}
                        >
                            Kolekcie <span className={styles.header__caret}>▾</span>
                        </button>
                        {menuOpen ? (
                            <div className={styles.header__menu}>
                                <div className={styles.header__menuInner}>
                                    {COLLECTIONS.filter((collection) => collection.key !== 'galeria').map((collection) => (
                                        <Link
                                            key={collection.key}
                                            to={collectionPath(collection.key)}
                                            className={styles.header__menuLink}
                                            onClick={closeMenu}
                                        >
                                            {collection.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <NavLink to={collectionPath('galeria')} className={styles.header__link}>
                        Galéria
                    </NavLink>
                    <NavLink to={ROUTES.prices} className={styles.header__link}>
                        Ceny
                    </NavLink>
                    <NavLink to={ROUTES.venue} className={styles.header__link}>
                        Svadobný priestor
                    </NavLink>
                    <NavLink to={ROUTES.about} className={styles.header__link}>
                        O salóne
                    </NavLink>
                    <NavLink to={ROUTES.contact} className={styles.header__link}>
                        Kontakt
                    </NavLink>
                </nav>

                <ButtonLink to={ROUTES.reservation} variant="gold" size="sm" className={styles.header__cta}>
                    Objednať skúšku
                </ButtonLink>

                <button
                    type="button"
                    className={styles.header__burger}
                    onClick={onOpenDrawer}
                    aria-label="Otvoriť menu"
                    aria-expanded={drawerOpen}
                >
                    <span />
                    <span />
                </button>
            </div>
        </header>
    );
};
