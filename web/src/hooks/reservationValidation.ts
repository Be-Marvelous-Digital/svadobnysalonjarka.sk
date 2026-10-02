import type { ReservationDraft } from './useReservationForm';

export type FieldName = keyof ReservationDraft;
export type FieldErrors = Partial<Record<FieldName, string>>;

/** Deliberately loose: enough to catch a typo, never enough to reject a real address. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Slovak numbers run to nine digits after the prefix; anything shorter is a slip. */
const MIN_PHONE_DIGITS = 9;

export function validateSchedule(draft: ReservationDraft): FieldErrors {
    const errors: FieldErrors = {};

    if (!draft.cat) errors.cat = 'Vyberte, čo si chcete vyskúšať.';
    if (!draft.date) errors.date = 'Vyberte dátum.';
    else if (draft.date < new Date().toISOString().slice(0, 10)) errors.date = 'Vyberte dnešný alebo neskorší dátum.';
    if (!draft.time) errors.time = 'Vyberte čas.';

    return errors;
}

export function validateContact(draft: ReservationDraft): FieldErrors {
    const errors: FieldErrors = {};

    const firstName = draft.firstName.trim();
    if (!firstName) errors.firstName = 'Vyplňte meno.';
    else if (firstName.length < 2) errors.firstName = 'Meno je príliš krátke.';

    const lastName = draft.lastName.trim();
    if (!lastName) errors.lastName = 'Vyplňte priezvisko.';
    else if (lastName.length < 2) errors.lastName = 'Priezvisko je príliš krátke.';

    const digits = draft.phone.replace(/\D/g, '');
    if (!draft.phone.trim()) errors.phone = 'Vyplňte telefónne číslo.';
    else if (digits.length < MIN_PHONE_DIGITS) errors.phone = 'Telefónne číslo je príliš krátke.';

    const email = draft.email.trim();
    if (!email) errors.email = 'Vyplňte e-mail.';
    else if (!EMAIL_PATTERN.test(email)) errors.email = 'E-mail nemá správny tvar, skontrolujte ho.';

    return errors;
}

export function validateStep(step: number, draft: ReservationDraft): FieldErrors {
    if (step === 1) return validateSchedule(draft);
    if (step === 2) return validateContact(draft);
    return {};
}

/** Everything the server will insist on, checked before the request leaves the browser. */
export function validateAll(draft: ReservationDraft): FieldErrors {
    return { ...validateSchedule(draft), ...validateContact(draft) };
}
