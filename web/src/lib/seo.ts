import type { Metadata } from 'next';
import { absoluteUrl, DEFAULT_IMAGE, SITE_NAME } from '@/utils/site';

interface PageMetaInput {
    title: string;
    description: string;
    path: string;
    image?: string;
    noIndex?: boolean;
}

export function pageMetadata({ title, description, path, image = DEFAULT_IMAGE, noIndex = false }: PageMetaInput): Metadata {
    const images = [{ url: absoluteUrl(image) }];

    return {
        title: { absolute: title },
        description,
        alternates: { canonical: path },
        robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
        openGraph: { type: 'website', siteName: SITE_NAME, locale: 'sk_SK', title, description, url: path, images },
        twitter: { card: 'summary_large_image', title, description, images },
    };
}
