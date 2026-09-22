export const CATEGORY_KEYS = [
    'svadobne',
    'spolocenske',
    'prijimacie',
    'zenich',
    'obuv',
    'galeria',
    'instagram',
    'osalone',
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

/**
 * Every category the admin can manage. `instagram` and `osalone` fill a strip on
 * the home page and the About page; neither has a public collection page of its
 * own, so neither is part of COLLECTIONS below.
 */
export const CATEGORY_LABELS: Record<CategoryKey, string> = {
    svadobne: 'Svadobné šaty',
    spolocenske: 'Spoločenské šaty',
    prijimacie: 'Prijímacie šaty',
    zenich: 'Pre ženíchov',
    obuv: 'Obuv a kabelky',
    galeria: 'Galéria salónu',
    instagram: 'Instagram na úvodnej stránke',
    osalone: 'O salóne',
};

export interface Collection {
    key: CategoryKey;
    label: string;
    kicker: string;
    flavor: string;
    description: string;
    facts: string[];
    teaser: string;
    cover: string;
    /**
     * Width divided by height of the gallery tiles. Portrait by default, because
     * dresses are photographed standing; shoes and bags come as landscape product
     * shots and get cropped to ribbons in a portrait frame.
     */
    tileRatio?: number;
}

export const COLLECTIONS: Collection[] = [
    {
        key: 'svadobne',
        label: 'Svadobné šaty',
        kicker: 'Kolekcia · Nevesty',
        flavor: 'Šaty, v ktorých vojdete do sály a všetci na chvíľu stíchnu.',
        description:
            'Stovky modelov na požičanie i predaj, od jemných a minimalistických po bohato zdobené. Veľkosti od 34 po 54, základná úprava na miery je v cene.',
        facts: [
            'Veľkosti 34 – 54, priebežne dopĺňame nové strihy',
            'Požičanie aj predaj, možný komisionálny predaj vlastných šiat',
            'Skúška bez časového limitu, len pre vás',
        ],
        teaser: 'Požičanie aj predaj',
        cover: '/assets/svadobne-2.webp',
    },
    {
        key: 'spolocenske',
        label: 'Spoločenské šaty',
        kicker: 'Kolekcia · Plesy a udalosti',
        flavor: 'Na ples, hostinu aj stužkovú: šaty, ktoré vydržia celú noc.',
        description: 'Plesová sezóna, svadobná hostina, promócie či stužková. Krátke aj dlhé, v jemných i výrazných farbách.',
        facts: [
            'Krátke aj dlhé strihy, široká paleta farieb',
            'Ideálne aj pre družičky a mamy nevesty',
            'Požičanie na 3 dni, možnosť predĺženia',
        ],
        teaser: 'Ples, svadba, promócie',
        cover: '/assets/spolocenske-1.webp',
    },
    {
        key: 'prijimacie',
        label: 'Prijímacie šaty',
        kicker: 'Kolekcia · Prvé sväté prijímanie',
        flavor: 'Malý veľký deň, šaty aj doplnky na jednom mieste.',
        description: 'Šaty na prvé sväté prijímanie vrátane doplnkov, venčeka, rukavičiek a kabelky.',
        facts: [
            'Kompletný outfit vrátane doplnkov',
            'Jemné strihy a materiály pre citlivú pokožku',
            'Odporúčame rezerváciu aspoň mesiac vopred',
        ],
        teaser: '1. sväté prijímanie',
        cover: '/assets/prijimacie-1.webp',
    },
    {
        key: 'zenich',
        label: 'Pre ženíchov',
        kicker: 'Kolekcia · Ženísi a družbovia',
        flavor: 'Oblek, ktorý stojí vedľa šiat, nie za nimi.',
        description: 'Obleky, vesty, kravaty, motýliky a obuv. Ženích aj družbovia sa môžu obliecť v jednom štýle.',
        facts: ['Obleky, vesty, kravaty aj motýliky', 'Zladíme štýl ženícha s celým sprievodom', 'Na požičanie aj na predaj'],
        teaser: 'Obleky, vesty, doplnky',
        cover: '/assets/zenich-1.webp',
    },
    {
        key: 'obuv',
        label: 'Obuv a kabelky',
        kicker: 'Kolekcia · Doplnky',
        flavor: 'Detail, ktorý outfit buď dotiahne, alebo pokazí.',
        description: 'Doplnky, ktoré celý outfit dokončia, k požičaným šatám za zvýhodnenú cenu.',
        facts: ['Obuv a kabelky ku každej kolekcii', 'Zvýhodnená cena k požičaným šatám', 'Poradíme s výberom priamo na skúške'],
        teaser: 'Doplníme celý outfit',
        cover: '/assets/obuv-6.webp',
        // Product shots on white, landscape; the portrait default crops them to ribbons.
        tileRatio: 620 / 474,
    },
    {
        key: 'galeria',
        label: 'Galéria salónu',
        kicker: 'Nahliadnite k nám',
        flavor: 'Priestor, v ktorom sa budete cítiť dobre, aj keď nie ste sama.',
        description: 'Fotografie z nášho salónu a zo skúšok. Priestor, v ktorom sa budete cítiť dobre.',
        facts: ['Súkromná skúšobňa, žiadny zhon', 'Stovky šiat priamo v salóne v Galante', 'Poradenstvo pri výbere aj úprave'],
        teaser: 'Nahliadnite k nám',
        cover: '/assets/hero.webp',
    },
];

/** Everything except the salon gallery, which is not something a client books a fitting for. */
export const BOOKABLE_COLLECTIONS = COLLECTIONS.filter((collection) => collection.key !== 'galeria');

export function findCollection(key: string | undefined): Collection | undefined {
    return COLLECTIONS.find((collection) => collection.key === key);
}
