'use client';

import { useCallback, type FormEvent } from 'react';
import { ReservationDone } from '@/components/reservation/ReservationDone';
import formStyles from '@/components/reservation/ReservationForm.module.scss';
import { StepContact } from '@/components/reservation/StepContact';
import { StepIndicator } from '@/components/reservation/StepIndicator';
import { StepReview } from '@/components/reservation/StepReview';
import { StepSchedule } from '@/components/reservation/StepSchedule';
import { useReservationForm } from '@/hooks/useReservationForm';
import styles from './ReservationPage.module.scss';

export const ReservationPage = () => {
    const form = useReservationForm();

    // Enter now does what the visible primary button does on whichever step is showing.
    const handleSubmit = useCallback(
        (event: FormEvent) => {
            event.preventDefault();
            if (form.step === 3) void form.submit();
            else form.next();
        },
        [form],
    );

    return (
        <section className={styles.reservation}>
            <div className={styles.reservation__inner}>
                <div className={styles.reservation__intro}>
                    <span className={styles.reservation__kicker}>Rezervácia</span>
                    <h1 className={styles.reservation__title}>Termín skúšky</h1>
                    <p className={styles.reservation__lead}>
                        Vyplnenie formulára trvá minútu. Rezervácia nie je potvrdená automaticky, majiteľka vám do 24 hodín zavolá
                        alebo napíše e-mail, termín potvrdí, alebo vám navrhne iné voľné dátumy a časy.
                    </p>
                </div>

                {form.done && form.confirmed ? (
                    <ReservationDone reservation={form.confirmed} onReset={form.reset} />
                ) : (
                    <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
                        <StepIndicator current={form.step} />

                        {form.error ? (
                            <p className={formStyles.form__error} role="alert">
                                {form.error}
                            </p>
                        ) : null}

                        {form.step === 1 ? (
                            <StepSchedule
                                draft={form.draft}
                                valid={form.stepValid}
                                errors={form.fieldErrors}
                                onChange={form.patch}
                            />
                        ) : null}

                        {form.step === 2 ? (
                            <StepContact
                                draft={form.draft}
                                valid={form.stepValid}
                                errors={form.fieldErrors}
                                onChange={form.patch}
                                onBack={form.back}
                            />
                        ) : null}

                        {form.step === 3 ? (
                            <StepReview draft={form.draft} submitting={form.submitting} onBack={form.back} />
                        ) : null}
                    </form>
                )}
            </div>
        </section>
    );
};
