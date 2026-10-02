import { useCallback, useState, type FormEvent } from 'react';
import { Button } from '@/components/Button';
import { Field, TextInput } from '@/components/Field';
import styles from './AdminLogin.module.scss';

interface AdminLoginProps {
    error: string;
    onSubmit: (username: string, password: string) => void;
}

export const AdminLogin = ({ error, onSubmit }: AdminLoginProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = useCallback(
        (event: FormEvent) => {
            event.preventDefault();
            if (username && password) onSubmit(username, password);
        },
        [onSubmit, username, password],
    );

    return (
        <form className={styles.login} onSubmit={handleSubmit}>
            <span className={styles.login__kicker}>Správa obsahu</span>
            <h1 className={styles.login__title}>Prihlásenie</h1>
            <Field label="Prihlasovacie meno">
                <TextInput
                    type="text"
                    value={username}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    onChange={(event) => setUsername(event.target.value)}
                />
            </Field>
            <Field label="Heslo">
                <TextInput
                    type="password"
                    value={password}
                    autoComplete="current-password"
                    onChange={(event) => setPassword(event.target.value)}
                />
            </Field>
            <span className={styles.login__error} role="alert">
                {error}
            </span>
            <Button type="submit" variant="dark" block>
                Prihlásiť sa
            </Button>
        </form>
    );
};
