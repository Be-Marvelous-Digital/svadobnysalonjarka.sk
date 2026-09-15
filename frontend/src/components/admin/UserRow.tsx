import { useCallback, useState } from 'react';
import { TextInput } from '@/components/Field';
import type { AdminUser } from '@/api/types';
import styles from './Admin.module.less';

interface UserRowProps {
    user: AdminUser;
    busy: boolean;
    canDelete: boolean;
    onResetPassword: (id: string, password: string, username: string) => void;
    onRemove: (id: string, username: string) => void;
}

export const UserRow = ({ user, busy, canDelete, onResetPassword, onRemove }: UserRowProps) => {
    const [resetting, setResetting] = useState(false);
    const [password, setPassword] = useState('');

    const startReset = useCallback(() => setResetting(true), []);
    const cancelReset = useCallback(() => {
        setResetting(false);
        setPassword('');
    }, []);

    const submitReset = useCallback(() => {
        onResetPassword(user.id, password, user.username);
        setResetting(false);
        setPassword('');
    }, [onResetPassword, password, user.id, user.username]);

    const handleRemove = useCallback(() => {
        if (window.confirm(`Zmazať používateľa „${user.username}“? Stratí prístup do administrácie.`)) {
            onRemove(user.id, user.username);
        }
    }, [onRemove, user.id, user.username]);

    return (
        <div className={styles.userRow}>
            <div className={styles.userRow__who}>
                <span className={styles.userRow__name}>
                    {user.username}
                    {user.isSelf ? <span className={styles.userRow__badge}>vy</span> : null}
                </span>
                <span className={styles.userRow__meta}>Vytvorený {new Date(user.createdAt).toLocaleDateString('sk-SK')}</span>
            </div>

            {resetting ? (
                <div className={styles.userRow__reset}>
                    <TextInput
                        compact
                        type="password"
                        value={password}
                        placeholder="Nové heslo"
                        autoComplete="new-password"
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                        type="button"
                        className={`${styles.action} ${styles['action--primary']}`}
                        disabled={busy || password.length < 10}
                        onClick={submitReset}
                    >
                        Nastaviť
                    </button>
                    <button type="button" className={`${styles.action} ${styles['action--outline']}`} onClick={cancelReset}>
                        Zrušiť
                    </button>
                </div>
            ) : (
                <div className={styles.userRow__actions}>
                    {user.isSelf ? (
                        <span className={styles.userRow__meta}>Svoje heslo zmeníte nižšie</span>
                    ) : (
                        <button
                            type="button"
                            className={`${styles.action} ${styles['action--outline']}`}
                            disabled={busy}
                            onClick={startReset}
                        >
                            Nastaviť heslo
                        </button>
                    )}
                    {canDelete && !user.isSelf ? (
                        <button
                            type="button"
                            className={`${styles.action} ${styles['action--danger']}`}
                            disabled={busy}
                            onClick={handleRemove}
                        >
                            Zmazať
                        </button>
                    ) : null}
                </div>
            )}
        </div>
    );
};
