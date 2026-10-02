import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COLLECTIONS, findCollection } from '@/data/collections';
import { coverFor } from '@/data/siteImages';
import { getGallery, getSiteImages } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { collectionPath } from '@/utils/routes';
import { CollectionPage } from '@/views/CollectionPage';

interface CollectionRouteProps {
    params: Promise<{ key: string }>;
}

export function generateStaticParams() {
    return COLLECTIONS.map((collection) => ({ key: collection.key }));
}

export async function generateMetadata({ params }: CollectionRouteProps): Promise<Metadata> {
    const collection = findCollection((await params).key);
    if (!collection) return {};

    return pageMetadata({
        title: `${collection.label} — Svadobný salón Jarka Galanta`,
        description: collection.description,
        path: collectionPath(collection.key),
        image: coverFor(await getSiteImages(), collection.key),
    });
}

export default async function Page({ params }: CollectionRouteProps) {
    const collection = findCollection((await params).key);
    if (!collection) notFound();

    const gallery = await getGallery();
    return <CollectionPage collection={collection} photos={gallery[collection.key]} />;
}
