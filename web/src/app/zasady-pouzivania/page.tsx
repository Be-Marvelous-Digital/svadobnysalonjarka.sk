import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ROUTES } from '@/utils/routes';
import { TermsPage } from '@/views/TermsPage';

export const metadata: Metadata = pageMetadata({
    title: 'Zásady používania — Svadobný salón Jarka Galanta',
    description:
        'Podmienky používania stránky svadobného salónu Jarka: na čo slúži rezervačný formulár, ako fungujú orientačné ceny a autorské práva k fotografiám.',
    path: ROUTES.terms,
});

export default function Page() {
    return <TermsPage />;
}
