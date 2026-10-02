import type { Metadata } from 'next';
import { imageFor } from '@/data/siteImages';
import { VENUE } from '@/data/venue';
import { getGallery, getSiteImages } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { ROUTES } from '@/utils/routes';
import { VenuePage } from '@/views/VenuePage';

export async function generateMetadata(): Promise<Metadata> {
    return pageMetadata({
        title: `Svadobný priestor ${VENUE.name} Topoľnica — Svadobný salón Jarka`,
        description: `Svadobná sála ${VENUE.name} v Topoľnici pri Galante. Pohostinstvo s kuchyňou na mieste, v deň svadby len pre vás. Šaty aj priestor na jednom mieste.`,
        path: ROUTES.venue,
        image: imageFor(await getSiteImages(), 'venue.hero'),
    });
}

export default async function Page() {
    const [images, gallery] = await Promise.all([getSiteImages(), getGallery()]);
    return <VenuePage photos={gallery.priestor} hero={imageFor(images, 'venue.hero')} />;
}
