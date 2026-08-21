import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const SITE_ORIGIN = 'https://svadobnysalonjarka.sk';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/assets/hero.webp`;

interface PageMeta {
    title: string;
    description: string;
    /** Absolute or root-relative; defaults to the hero shot. */
    image?: string;
    /** Keeps a page out of the index without hiding it from users. */
    noIndex?: boolean;
}

function upsert(selector: string, create: () => HTMLElement, apply: (element: HTMLElement) => void): void {
    let tag = document.head.querySelector<HTMLElement>(selector);
    if (!tag) {
        tag = create();
        document.head.appendChild(tag);
    }
    apply(tag);
}

function setMetaName(name: string, content: string): void {
    upsert(
        `meta[name="${name}"]`,
        () => Object.assign(document.createElement('meta'), { name }),
        (tag) => tag.setAttribute('content', content),
    );
}

function setMetaProperty(property: string, content: string): void {
    upsert(
        `meta[property="${property}"]`,
        () => {
            const tag = document.createElement('meta');
            tag.setAttribute('property', property);
            return tag;
        },
        (tag) => tag.setAttribute('content', content),
    );
}

function setCanonical(href: string): void {
    upsert(
        'link[rel="canonical"]',
        () => Object.assign(document.createElement('link'), { rel: 'canonical' }),
        (tag) => tag.setAttribute('href', href),
    );
}

/**
 * A client-rendered SPA serves one static shell to every route, so the per-route
 * title, description, canonical and Open Graph tags have to be written on mount.
 */
export function usePageMeta({ title, description, image, noIndex = false }: PageMeta): void {
    const { pathname } = useLocation();

    useEffect(() => {
        const url = `${SITE_ORIGIN}${pathname}`;
        const absoluteImage = image ? (image.startsWith('http') ? image : `${SITE_ORIGIN}${image}`) : DEFAULT_IMAGE;

        document.title = title;
        setMetaName('description', description);
        setMetaName('robots', noIndex ? 'noindex, nofollow' : 'index, follow');
        setCanonical(url);

        setMetaProperty('og:title', title);
        setMetaProperty('og:description', description);
        setMetaProperty('og:url', url);
        setMetaProperty('og:image', absoluteImage);
        setMetaProperty('og:type', 'website');

        setMetaName('twitter:card', 'summary_large_image');
        setMetaName('twitter:title', title);
        setMetaName('twitter:description', description);
        setMetaName('twitter:image', absoluteImage);
    }, [title, description, image, noIndex, pathname]);
}
