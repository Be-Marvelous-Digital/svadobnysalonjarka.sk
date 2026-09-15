/**
 * Mirrors the rules in the backend's createUserSchema and changePasswordSchema.
 * The server stays the authority; this exists so a mistake is named next to the
 * field that caused it instead of silently disabling the button.
 */

export const MIN_PASSWORD = 10;
export const MIN_USERNAME = 3;

const USERNAME_PATTERN = /^[a-z0-9._-]+$/;

export function validateUsername(value: string): string | undefined {
    const username = value.trim();
    if (!username) return 'Vyplňte prihlasovacie meno.';
    if (username.length < MIN_USERNAME) return `Meno musí mať aspoň ${MIN_USERNAME} znaky.`;
    if (username.length > 60) return 'Meno je príliš dlhé.';
    if (!USERNAME_PATTERN.test(username.toLowerCase())) {
        return 'Použite len písmená bez diakritiky, číslice, bodku, pomlčku alebo podčiarkovník.';
    }
    return undefined;
}

export function validatePassword(value: string): string | undefined {
    if (!value) return 'Vyplňte heslo.';
    if (value.length < MIN_PASSWORD) return `Heslo musí mať aspoň ${MIN_PASSWORD} znakov.`;
    if (value.length > 200) return 'Heslo je príliš dlhé.';
    if (!/[a-z]/i.test(value) || !/\d/.test(value)) return 'Heslo musí obsahovať aspoň jedno písmeno a jednu číslicu.';
    return undefined;
}
