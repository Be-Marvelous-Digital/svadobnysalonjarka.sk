import type { Metadata } from 'next';
import { preload } from 'react-dom';
import { HERO_IMAGE_SRC } from '@/data/siteImages';
import { getGallery, getSiteImages } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { ROUTES } from '@/utils/routes';
import { HomePage } from '@/views/HomePage';

export const metadata: Metadata = pageMetadata({
    title: 'Svadobný salón Jarka Galanta — svadobné a spoločenské šaty',
    description:
        'Svadobné, spoločenské a prijímacie šaty, obleky pre ženíchov aj doplnky. Salón v Galante od roku 2007. Objednajte si termín skúšky.',
    path: ROUTES.home,
});

export default async function Page() {
    preload(HERO_IMAGE_SRC, { as: 'image', fetchPriority: 'high' });
    const [images, gallery] = await Promise.all([getSiteImages(), getGallery()]);

    return <HomePage images={images} instagram={gallery.instagram} />;
}
