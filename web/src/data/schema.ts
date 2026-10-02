import { COLLECTIONS, type Collection } from './collections';
import { CONTACT, OPENING_ROWS } from './contact';
import { VENUE } from './venue';
import { SITE_ORIGIN } from '@/utils/site';
import { collectionPath, ROUTES } from '@/utils/routes';

const DAY_URIS: Record<string, string> = {
    Pondelok: 'https://schema.org/Monday',
    Utorok: 'https://schema.org/Tuesday',
    Streda: 'https://schema.org/Wednesday',
    Štvrtok: 'https://schema.org/Thursday',
    Piatok: 'https://schema.org/Friday',
    Sobota: 'https://schema.org/Saturday',
    Nedeľa: 'https://schema.org/Sunday',
};

/** "10:00 – 17:00" as the 24h pair schema.org wants. */
function splitHours(hours: string): [string, string] | null {
    const match = hours.match(/^(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})$/);
    if (!match?.[1] || !match[2]) return null;
    const pad = (time: string) => (time.length === 4 ? `0${time}` : time);
    return [pad(match[1]), pad(match[2])];
}

const openingHours = OPENING_ROWS.filter((row) => !row.closed).flatMap((row) => {
    const parsed = splitHours(row.hours);
    const dayOfWeek = DAY_URIS[row.day];
    if (!parsed || !dayOfWeek) return [];
    return [{ '@type': 'OpeningHoursSpecification', dayOfWeek, opens: parsed[0], closes: parsed[1] }];
});

export const LOCAL_BUSINESS_SCHEMA = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    '@id': `${SITE_ORIGIN}/#salon`,
    name: 'Svadobný salón Jarka',
    description:
        'Svadobné, spoločenské a prijímacie šaty, obleky pre ženíchov aj doplnky. Požičovňa a predaj v Galante od roku 2007.',
    url: SITE_ORIGIN,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    image: `${SITE_ORIGIN}/assets/hero.webp`,
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    foundingDate: '2007',
    address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT.street,
        addressLocality: 'Galanta',
        postalCode: '924 01',
        addressCountry: 'SK',
    },
    areaServed: [
        { '@type': 'City', name: 'Galanta' },
        { '@type': 'AdministrativeArea', name: 'Trnavský kraj' },
    ],
    openingHoursSpecification: openingHours,
    sameAs: [CONTACT.instagram, CONTACT.facebook],
    hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Kolekcie',
        itemListElement: COLLECTIONS.filter((collection) => collection.key !== 'galeria').map((collection) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Product', name: collection.label, description: collection.description },
            url: `${SITE_ORIGIN}${collectionPath(collection.key)}`,
        })),
    },
    potentialAction: {
        '@type': 'ReserveAction',
        name: 'Objednať termín skúšky',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_ORIGIN}${ROUTES.reservation}`,
            actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'],
        },
    },
} as const;

export function breadcrumbSchema(trail: Array<{ name: string; path: string }>): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((entry, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: entry.name,
            item: `${SITE_ORIGIN}${entry.path}`,
        })),
    };
}

export function collectionSchema(collection: Collection, photoCount: number): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: collection.label,
        description: collection.description,
        url: `${SITE_ORIGIN}${collectionPath(collection.key)}`,
        isPartOf: { '@id': `${SITE_ORIGIN}/#salon` },
        about: { '@type': 'Product', name: collection.label, description: collection.description },
        ...(photoCount > 0 ? { mainEntity: { '@type': 'ImageGallery', numberOfItems: photoCount } } : {}),
    };
}

/** The venue is a place of its own, so it gets its own entry rather than a line in the salon's. */
export function venueSchema(image: string): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'EventVenue',
        name: `${VENUE.name} — svadobný priestor`,
        description:
            'Svadobná sála v Topoľnici pri Galante. Pohostinstvo s kuchyňou na mieste, v deň svadby vyhradené jednej oslave.',
        url: `${SITE_ORIGIN}${ROUTES.venue}`,
        image: image.startsWith('http') ? image : `${SITE_ORIGIN}${image}`,
        address: {
            '@type': 'PostalAddress',
            addressLocality: VENUE.place,
            addressRegion: 'Trnavský kraj',
            addressCountry: 'SK',
        },
        telephone: CONTACT.phone,
        isAccessibleForFree: false,
        provider: { '@id': `${SITE_ORIGIN}/#salon` },
    };
}
