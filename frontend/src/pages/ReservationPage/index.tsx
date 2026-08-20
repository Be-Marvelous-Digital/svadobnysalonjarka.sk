import { ReservationDone } from '@/components/reservation/ReservationDone';
import formStyles from '@/components/reservation/ReservationForm.module.less';
import { StepContact } from '@/components/reservation/StepContact';
import { StepIndicator } from '@/components/reservation/StepIndicator';
import { StepReview } from '@/components/reservation/StepReview';
import { StepSchedule } from '@/components/reservation/StepSchedule';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useReservationForm } from '@/hooks/useReservationForm';
import styles from './ReservationPage.module.less';

export const ReservationPage = () => {
    const form = useReservationForm();

    usePageMeta({
        title: 'Rezervácia termínu — Svadobný salón Jarka Galanta',
        description:
            'Objednajte si termín skúšky vo svadobnom salóne Jarka v Galante. Vyberte typ šiat, dátum a čas, ozveme sa do 24 hodín.',
    });

    return (
        <section className={styles.reservation}>
            <div className={styles.reservation__inner}>
                <div className={styles.reservation__intro}>
                    <span className={styles.reservation__kicker}>Rezervácia</span>
                    <h1 className={styles.reservation__title}>Termín skúšky</h1>
                    <p className={styles.reservation__lead}>
                        Vyplnenie formulára trvá minútu. Rezervácia nie je potvrdená automaticky, majiteľka vás do 24 hodín
                        kontaktuje telefonicky, termín potvrdí, alebo vám navrhne iné voľné dátumy a časy.
                    </p>
                </div>

                {form.done && form.confirmed ? (
                    <ReservationDone reservation={form.confirmed} onReset={form.reset} />
                ) : (
                    <div className={formStyles.form}>
                        <StepIndicator current={form.step} />

                        {form.step === 1 ? (
                            <StepSchedule draft={form.draft} valid={form.stepValid} onChange={form.patch} onNext={form.next} />
                        ) : null}

                        {form.step === 2 ? (
                            <StepContact
                                draft={form.draft}
                                valid={form.stepValid}
                                onChange={form.patch}
                                onBack={form.back}
                                onNext={form.next}
                            />
                        ) : null}

                        {form.step === 3 ? (
                            <StepReview
                                draft={form.draft}
                                submitting={form.submitting}
                                error={form.error}
                                onBack={form.back}
                                onSubmit={form.submit}
                            />
                        ) : null}
                    </div>
                )}
            </div>
        </section>
    );
};
