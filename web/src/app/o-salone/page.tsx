import type { Metadata } from 'next';
import { getGallery } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { ROUTES } from '@/utils/routes';
import { AboutPage } from '@/views/AboutPage';

export const metadata: Metadata = pageMetadata({
    title: 'O salóne — Svadobný salón Jarka Galanta',
    description: 'Svadobný salón Jarka v Galante funguje od roku 2007. Stovky šiat pre nevesty, ženíchov a družičky.',
    path: ROUTES.about,
});

export default async function Page() {
    const gallery = await getGallery();
    return <AboutPage photos={gallery.osalone} />;
}
