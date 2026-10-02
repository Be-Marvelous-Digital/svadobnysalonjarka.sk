import type { Metadata } from 'next';
import { CONTACT } from '@/data/contact';
import { pageMetadata } from '@/lib/seo';
import { ROUTES } from '@/utils/routes';
import { ContactPage } from '@/views/ContactPage';

export const metadata: Metadata = pageMetadata({
    title: 'Kontakt — Svadobný salón Jarka Galanta',
    description: `Svadobný salón Jarka, ${CONTACT.street}, ${CONTACT.city}. Telefón ${CONTACT.phone}, otváracie hodiny a mapa.`,
    path: ROUTES.contact,
});

export default function Page() {
    return <ContactPage />;
}
