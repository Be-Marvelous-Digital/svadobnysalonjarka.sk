import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ROUTES } from '@/utils/routes';
import { ReservationPage } from '@/views/ReservationPage';

export const metadata: Metadata = pageMetadata({
    title: 'Rezervácia termínu — Svadobný salón Jarka Galanta',
    description:
        'Objednajte si termín skúšky vo svadobnom salóne Jarka v Galante. Vyberte typ šiat, dátum a čas, ozveme sa do 24 hodín.',
    path: ROUTES.reservation,
});

export default function Page() {
    return <ReservationPage />;
}
