import { useCallback, useState } from 'react';
import { AdminGallery } from '@/components/admin/AdminGallery';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminInquiries } from '@/components/admin/AdminInquiries';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAdminSession } from '@/hooks/useAdminSession';
import styles from './AdminPage.module.less';

type AdminTab = 'dopyty' | 'galeria' | 'pouzivatelia';

export const AdminPage = () => {
    const session = useAdminSession();
    const [tab, setTab] = useState<AdminTab>('dopyty');

    const { login } = session;
    const handleLogin = useCallback((username: string, password: string) => void login(username, password), [login]);

    usePageMeta({
        title: 'Správa obsahu — Svadobný salón Jarka',
        description: 'Interná správa rezervácií a galérie.',
        noIndex: true,
    });

    if (session.checking) return <section className={styles.admin} />;

    return (
        <section className={styles.admin}>
            <div className={styles.admin__inner}>
                {session.authed ? (
                    <>
                        <div className={styles.admin__head}>
                            <div className={styles.admin__heading}>
                                <span className={styles.admin__kicker}>Správa obsahu</span>
                                <h1 className={styles.admin__title}>Dopyty a galéria</h1>
                            </div>
                            <button type="button" className={styles.admin__logout} onClick={() => void session.logout()}>
                                Odhlásiť sa
                            </button>
                        </div>

                        <div className={styles.admin__tabs}>
                            <button
                                type="button"
                                className={[styles.admin__tab, tab === 'dopyty' && styles['admin__tab--active']]
                                    .filter(Boolean)
                                    .join(' ')}
                                onClick={() => setTab('dopyty')}
                            >
                                Dopyty
                            </button>
                            <button
                                type="button"
                                className={[styles.admin__tab, tab === 'galeria' && styles['admin__tab--active']]
                                    .filter(Boolean)
                                    .join(' ')}
                                onClick={() => setTab('galeria')}
                            >
                                Galéria
                            </button>
                            <button
                                type="button"
                                className={[styles.admin__tab, tab === 'pouzivatelia' && styles['admin__tab--active']]
                                    .filter(Boolean)
                                    .join(' ')}
                                onClick={() => setTab('pouzivatelia')}
                            >
                                Používatelia
                            </button>
                        </div>

                        {tab === 'dopyty' ? <AdminInquiries /> : null}
                        {tab === 'galeria' ? <AdminGallery /> : null}
                        {tab === 'pouzivatelia' ? <AdminUsers /> : null}
                    </>
                ) : (
                    <AdminLogin error={session.error} onSubmit={handleLogin} />
                )}
            </div>
        </section>
    );
};
