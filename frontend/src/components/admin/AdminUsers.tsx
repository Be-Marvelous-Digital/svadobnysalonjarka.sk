import { useCallback, useState, type FormEvent } from 'react';
import { Field, TextInput } from '@/components/Field';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { UserRow } from './UserRow';
import styles from './Admin.module.less';

const MIN_PASSWORD = 10;

export const AdminUsers = () => {
    const { users, busy, error, notice, create, changeOwnPassword, resetPassword, remove } = useAdminUsers();

    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [ownPassword, setOwnPassword] = useState('');

    const handleCreate = useCallback(
        async (event: FormEvent) => {
            event.preventDefault();
            if (await create(newUsername.trim(), newPassword)) {
                setNewUsername('');
                setNewPassword('');
            }
        },
        [create, newUsername, newPassword],
    );

    const handleOwnPassword = useCallback(
        async (event: FormEvent) => {
            event.preventDefault();
            if (await changeOwnPassword(currentPassword, ownPassword)) {
                setCurrentPassword('');
                setOwnPassword('');
            }
        },
        [changeOwnPassword, currentPassword, ownPassword],
    );

    const handleReset = useCallback(
        (id: string, password: string, username: string) => void resetPassword(id, password, username),
        [resetPassword],
    );
    const handleRemove = useCallback((id: string, username: string) => void remove(id, username), [remove]);

    return (
        <div className={styles.users}>
            <div className={styles.block__head}>
                <span className={styles.block__title}>Používatelia</span>
                <span className={styles.block__count}>
                    {users.length} {users.length === 1 ? 'účet' : 'účty'}
                </span>
            </div>

            <span className={styles.users__status} role="status">
                {error || notice}
            </span>

            <div className={styles.users__list}>
                {users.map((user) => (
                    <UserRow
                        key={user.id}
                        user={user}
                        busy={busy}
                        // The API refuses to empty the users collection; the UI says so first.
                        canDelete={users.length > 1}
                        onResetPassword={handleReset}
                        onRemove={handleRemove}
                    />
                ))}
            </div>

            <div className={styles.users__forms}>
                <form className={styles.card} onSubmit={handleCreate}>
                    <div className={styles.card__group}>
                        <span className={styles.card__title}>Nový používateľ</span>
                        <span className={styles.card__note}>
                            Každý má rovnaké práva. Heslo musí mať aspoň {MIN_PASSWORD} znakov a obsahovať písmeno aj číslicu.
                        </span>
                    </div>
                    <div className={styles.card__side}>
                        <Field label="Prihlasovacie meno">
                            <TextInput
                                compact
                                type="text"
                                value={newUsername}
                                autoComplete="off"
                                autoCapitalize="none"
                                spellCheck={false}
                                placeholder="napr. jarka"
                                onChange={(event) => setNewUsername(event.target.value)}
                            />
                        </Field>
                        <Field label="Heslo">
                            <TextInput
                                compact
                                type="password"
                                value={newPassword}
                                autoComplete="new-password"
                                onChange={(event) => setNewPassword(event.target.value)}
                            />
                        </Field>
                        <button
                            type="submit"
                            className={`${styles.action} ${styles['action--primary']}`}
                            disabled={busy || newUsername.trim().length < 3 || newPassword.length < MIN_PASSWORD}
                        >
                            Vytvoriť účet
                        </button>
                    </div>
                </form>

                <form className={styles.card} onSubmit={handleOwnPassword}>
                    <div className={styles.card__group}>
                        <span className={styles.card__title}>Zmeniť moje heslo</span>
                        <span className={styles.card__note}>
                            Pre istotu overíme súčasné heslo. Po zmene zostanete prihlásený.
                        </span>
                    </div>
                    <div className={styles.card__side}>
                        <Field label="Súčasné heslo">
                            <TextInput
                                compact
                                type="password"
                                value={currentPassword}
                                autoComplete="current-password"
                                onChange={(event) => setCurrentPassword(event.target.value)}
                            />
                        </Field>
                        <Field label="Nové heslo">
                            <TextInput
                                compact
                                type="password"
                                value={ownPassword}
                                autoComplete="new-password"
                                onChange={(event) => setOwnPassword(event.target.value)}
                            />
                        </Field>
                        <button
                            type="submit"
                            className={`${styles.action} ${styles['action--primary']}`}
                            disabled={busy || !currentPassword || ownPassword.length < MIN_PASSWORD}
                        >
                            Zmeniť heslo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
