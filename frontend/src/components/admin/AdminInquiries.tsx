import { useCallback, useMemo } from 'react';
import { useAdminInquiries } from '@/hooks/useAdminInquiries';
import { InquiryCard } from './InquiryCard';
import styles from './Admin.module.less';

export const AdminInquiries = () => {
    const { inquiries, loading, error, setHandled, remove } = useAdminInquiries();

    const handleToggle = useCallback((id: string, handled: boolean) => void setHandled(id, handled), [setHandled]);
    const handleRemove = useCallback((id: string) => void remove(id), [remove]);

    // Newest first: the one that just came in is the one the owner wants.
    const sorted = useMemo(
        () => [...inquiries].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
        [inquiries],
    );
    const fresh = useMemo(() => sorted.filter((inquiry) => !inquiry.handled), [sorted]);
    const handled = useMemo(() => sorted.filter((inquiry) => inquiry.handled), [sorted]);

    if (loading) return <div className={styles.panel} />;

    return (
        <div className={styles.panel}>
            {error ? (
                <span className={styles.block__count} role="alert">
                    {error}
                </span>
            ) : null}

            <div className={styles.block}>
                <div className={styles.block__head}>
                    <span className={styles.block__title}>Nové dopyty</span>
                    <span className={styles.block__count}>{fresh.length}</span>
                </div>
                <span className={styles.block__empty}>
                    Termín sa nepotvrdzuje tu — zavolajte klientke alebo jej odpíšte e-mailom a dohodnite sa priamo. Vybavené
                    dopyty odložte tlačidlom „Vybavené“.
                </span>

                {fresh.length === 0 ? (
                    <span className={styles.block__empty}>Žiadne nové dopyty.</span>
                ) : (
                    fresh.map((inquiry) => (
                        <InquiryCard key={inquiry.id} inquiry={inquiry} onToggleHandled={handleToggle} onRemove={handleRemove} />
                    ))
                )}
            </div>

            {handled.length > 0 ? (
                <div className={`${styles.block} ${styles['block--separated']}`}>
                    <div className={styles.block__head}>
                        <span className={styles.block__title}>Vybavené</span>
                        <span className={styles.block__count}>{handled.length}</span>
                    </div>
                    {handled.map((inquiry) => (
                        <InquiryCard key={inquiry.id} inquiry={inquiry} onToggleHandled={handleToggle} onRemove={handleRemove} />
                    ))}
                </div>
            ) : null}
        </div>
    );
};
