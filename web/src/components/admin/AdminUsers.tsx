import { useCallback, useState, type FormEvent } from 'react';
import { Field, TextInput } from '@/components/Field';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { UserRow } from './UserRow';
import { MIN_PASSWORD, validatePassword, validateUsername } from './userValidation';
import styles from './Admin.module.scss';

export const AdminUsers = () => {
    const { users, busy, error, notice, create, changeOwnPassword, resetPassword, remove } = useAdminUsers();

    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [ownPassword, setOwnPassword] = useState('');

    // A disabled button cannot say what is wrong with it, so both forms stay
    // pressable and answer on submit.
    const [createErrors, setCreateErrors] = useState<{ username?: string; password?: string }>({});
    const [ownErrors, setOwnErrors] = useState<{ current?: string; password?: string }>({});

    const handleCreate = useCallback(
        async (event: FormEvent) => {
            event.preventDefault();

            const errors = { username: validateUsername(newUsername), password: validatePassword(newPassword) };
            setCreateErrors(errors);
            if (errors.username || errors.password) return;

            if (await create(newUsername.trim(), newPassword)) {
                setNewUsername('');
                setNewPassword('');
                setCreateErrors({});
            }
        },
        [create, newUsername, newPassword],
    );

    const handleOwnPassword = useCallback(
        async (event: FormEvent) => {
            event.preventDefault();

            const errors = {
                current: currentPassword ? undefined : 'Vyplňte súčasné heslo.',
                password: validatePassword(ownPassword),
            };
            setOwnErrors(errors);
            if (errors.current || errors.password) return;

            if (await changeOwnPassword(currentPassword, ownPassword)) {
                setCurrentPassword('');
                setOwnPassword('');
                setOwnErrors({});
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
                        <Field label="Prihlasovacie meno" error={createErrors.username}>
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
                        <Field label="Heslo" error={createErrors.password}>
                            <TextInput
                                compact
                                type="password"
                                value={newPassword}
                                autoComplete="new-password"
                                onChange={(event) => setNewPassword(event.target.value)}
                            />
                        </Field>
                        <button type="submit" className={`${styles.action} ${styles['action--primary']}`} disabled={busy}>
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
                        <Field label="Súčasné heslo" error={ownErrors.current}>
                            <TextInput
                                compact
                                type="password"
                                value={currentPassword}
                                autoComplete="current-password"
                                onChange={(event) => setCurrentPassword(event.target.value)}
                            />
                        </Field>
                        <Field label="Nové heslo" error={ownErrors.password}>
                            <TextInput
                                compact
                                type="password"
                                value={ownPassword}
                                autoComplete="new-password"
                                onChange={(event) => setOwnPassword(event.target.value)}
                            />
                        </Field>
                        <button type="submit" className={`${styles.action} ${styles['action--primary']}`} disabled={busy}>
                            Zmeniť heslo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
