import type { Metadata } from 'next';
import { getSiteImages } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { ROUTES } from '@/utils/routes';
import { PricesPage } from '@/views/PricesPage';

export const metadata: Metadata = pageMetadata({
    title: 'Ceny — Svadobný salón Jarka Galanta',
    description:
        'Cenník požičovného a predaja svadobných, spoločenských a prijímacích šiat, oblekov, bižutérie aj úprav na mieru.',
    path: ROUTES.prices,
});

export default async function Page() {
    return <PricesPage images={await getSiteImages()} />;
}
