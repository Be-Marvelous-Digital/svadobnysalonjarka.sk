import type { MetadataRoute } from 'next';
import { COLLECTIONS } from '@/data/collections';
import { getGallery } from '@/lib/content';
import { collectionPath, ROUTES } from '@/utils/routes';
import { absoluteUrl } from '@/utils/site';

const PAGE_PRIORITIES: Array<[string, number]> = [
    [ROUTES.home, 1.0],
    [ROUTES.reservation, 0.9],
    [ROUTES.prices, 0.8],
    [ROUTES.venue, 0.8],
    [ROUTES.contact, 0.8],
    [ROUTES.about, 0.7],
    [ROUTES.privacy, 0.3],
    [ROUTES.terms, 0.3],
];

const COLLECTION_PRIORITIES: Record<string, number> = {
    svadobne: 0.9,
    spolocenske: 0.9,
    prijimacie: 0.8,
    zenich: 0.8,
    obuv: 0.7,
    galeria: 0.7,
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const gallery = await getGallery();
    const lastModified = new Date();

    const pages = PAGE_PRIORITIES.map(([path, priority]) => ({ url: absoluteUrl(path), lastModified, priority }));

    const collections = COLLECTIONS.map((collection) => ({
        url: absoluteUrl(collectionPath(collection.key)),
        lastModified,
        priority: COLLECTION_PRIORITIES[collection.key] ?? 0.5,
        images: gallery[collection.key].map(absoluteUrl),
    }));

    return [...pages, ...collections];
}
