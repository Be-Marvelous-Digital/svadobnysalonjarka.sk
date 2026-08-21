import { useCallback, useState } from 'react';
import { AdminGallery } from '@/components/admin/AdminGallery';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminReservations } from '@/components/admin/AdminReservations';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAdminSession } from '@/hooks/useAdminSession';
import styles from './AdminPage.module.less';

type AdminTab = 'rezervacie' | 'galeria';

export const AdminPage = () => {
    const session = useAdminSession();
    const [tab, setTab] = useState<AdminTab>('rezervacie');

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
                                <h1 className={styles.admin__title}>Galéria a rezervácie</h1>
                            </div>
                            <button type="button" className={styles.admin__logout} onClick={() => void session.logout()}>
                                Odhlásiť sa
                            </button>
                        </div>

                        <div className={styles.admin__tabs}>
                            <button
                                type="button"
                                className={[styles.admin__tab, tab === 'rezervacie' && styles['admin__tab--active']]
                                    .filter(Boolean)
                                    .join(' ')}
                                onClick={() => setTab('rezervacie')}
                            >
                                Rezervácie
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
                        </div>

                        {tab === 'rezervacie' ? <AdminReservations /> : <AdminGallery />}
                    </>
                ) : (
                    <AdminLogin error={session.error} onSubmit={handleLogin} />
                )}
            </div>
        </section>
    );
};
