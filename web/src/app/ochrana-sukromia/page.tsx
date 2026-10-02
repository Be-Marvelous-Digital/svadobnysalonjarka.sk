import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ROUTES } from '@/utils/routes';
import { PrivacyPage } from '@/views/PrivacyPage';

export const metadata: Metadata = pageMetadata({
    title: 'Ochrana súkromia — Svadobný salón Jarka Galanta',
    description:
        'Ako svadobný salón Jarka spracúva osobné údaje z rezervačného formulára, aké cookies stránka používa a aké máte práva podľa GDPR.',
    path: ROUTES.privacy,
});

export default function Page() {
    return <PrivacyPage />;
}
