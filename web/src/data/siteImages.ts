/** Keep in step with SITE_IMAGE_SLOTS in the backend; the server refuses anything else. */
export const SITE_IMAGE_SLOTS = [
    'home.hero',
    'home.story',
    'home.groom',
    'collection.svadobne',
    'collection.spolocenske',
    'collection.prijimacie',
    'collection.zenich',
    'collection.obuv',
    'prices.portrait',
    'home.venue',
    'venue.hero',
] as const;

export type SiteImageSlot = (typeof SITE_IMAGE_SLOTS)[number];

/** Slot to URL for the positions the salon has overridden. */
export type SiteImages = Partial<Record<SiteImageSlot, string>>;

/**
 * The hero is read from CSS and preloaded from the static shell, so it cannot
 * take a URL that only the API knows. nginx serves this path and falls back to
 * the bundled photo, which keeps one URL correct whether or not a replacement
 * has been uploaded.
 */
export const HERO_IMAGE_SRC = '/images/site/hero.webp';

export interface SiteImageSlotInfo {
    slot: SiteImageSlot;
    /** Where the photo sits, in the salon's words rather than a filename. */
    label: string;
    /** What the position is for, when the label alone does not settle it. */
    hint: string;
    /** Rendered shape, so a portrait is not dropped into a landscape frame. */
    ratio: string;
    shape: 'landscape' | 'portrait' | 'square';
    /** Shipped with the frontend and used until the slot is overridden. */
    fallback: string;
    alt: string;
}

export interface SiteImageGroup {
    page: string;
    slots: SiteImageSlotInfo[];
}

export const SITE_IMAGE_GROUPS: SiteImageGroup[] = [
    {
        page: 'Úvodná stránka',
        slots: [
            {
                slot: 'home.hero',
                label: 'Veľká fotka v hlavičke',
                hint: 'Prvé, čo návštevník uvidí. Cez celú obrazovku, text sa píše cez ňu.',
                ratio: '16 / 9',
                shape: 'landscape',
                fallback: HERO_IMAGE_SRC,
                alt: 'Nevesta vo svadobných šatách v salóne Jarka',
            },
            {
                slot: 'home.story',
                label: 'Fotka pri texte o salóne',
                hint: 'Vpravo od odseku o histórii salónu.',
                ratio: '4 / 4.6',
                shape: 'portrait',
                fallback: '/assets/svadobne-2.webp',
                alt: 'Svadobné šaty z ponuky salónu Jarka v Galante',
            },
            {
                slot: 'home.groom',
                label: 'Fotka v páse pre ženíchov',
                hint: 'Tmavý pás s oblekmi, pod textom o salóne.',
                ratio: '3 / 4',
                shape: 'portrait',
                fallback: '/assets/zenich-4.webp',
                alt: 'Oblek pre ženícha',
            },
        ],
    },
    {
        page: 'Svadobný priestor',
        slots: [
            {
                slot: 'home.venue',
                label: 'Fotka v páse na úvodnej stránke',
                hint: 'Pás, ktorý na úvodnej stránke odkazuje na svadobný priestor.',
                ratio: '4 / 3',
                shape: 'landscape',
                fallback: '/assets/hero.webp',
                alt: 'Svadobný priestor K-centrum v Topoľnici',
            },
            {
                slot: 'venue.hero',
                label: 'Veľká fotka v hlavičke podstránky',
                hint: 'Prvé, čo návštevník uvidí na stránke Svadobný priestor.',
                ratio: '16 / 9',
                shape: 'landscape',
                fallback: '/assets/hero.webp',
                alt: 'Sála svadobného priestoru K-centrum',
            },
        ],
    },
    {
        page: 'Cenník',
        slots: [
            {
                slot: 'prices.portrait',
                label: 'Fotka v hlavičke cenníka',
                hint: 'Vpravo od nadpisu Cenník, vedľa podmienok požičania.',
                ratio: '2 / 3',
                shape: 'portrait',
                fallback: '/assets/svadobne-1.webp',
                alt: 'Nevesta v svadobných šatách zo salónu Jarka',
            },
        ],
    },
];

/**
 * Covers are edited inside each collection's own tab in the gallery, next to the
 * photos they sit above, rather than in the page list — so they are registered
 * here instead of in SITE_IMAGE_GROUPS.
 */
export const COLLECTION_COVERS: SiteImageSlotInfo[] = [
    {
        slot: 'collection.svadobne',
        label: 'Úvodná fotka kolekcie',
        hint: 'Na dlaždici na úvodnej stránke a v náhľade pri zdieľaní odkazu.',
        ratio: '3 / 4.2',
        shape: 'portrait',
        fallback: '/assets/svadobne-2.webp',
        alt: 'Svadobné šaty',
    },
    {
        slot: 'collection.spolocenske',
        label: 'Úvodná fotka kolekcie',
        hint: 'Na dlaždici na úvodnej stránke a v náhľade pri zdieľaní odkazu.',
        ratio: '3 / 4.2',
        shape: 'portrait',
        fallback: '/assets/spolocenske-1.webp',
        alt: 'Spoločenské šaty',
    },
    {
        slot: 'collection.prijimacie',
        label: 'Úvodná fotka kolekcie',
        hint: 'Na dlaždici na úvodnej stránke a v náhľade pri zdieľaní odkazu.',
        ratio: '3 / 4.2',
        shape: 'portrait',
        fallback: '/assets/prijimacie-1.webp',
        alt: 'Prijímacie šaty',
    },
    {
        slot: 'collection.zenich',
        label: 'Úvodná fotka kolekcie',
        hint: 'Na dlaždici na úvodnej stránke a v náhľade pri zdieľaní odkazu.',
        ratio: '3 / 4.2',
        shape: 'portrait',
        fallback: '/assets/zenich-1.webp',
        alt: 'Obleky pre ženíchov',
    },
    {
        slot: 'collection.obuv',
        label: 'Úvodná fotka kolekcie',
        hint: 'Na dlaždici na úvodnej stránke a v náhľade pri zdieľaní odkazu.',
        ratio: '3 / 4.2',
        shape: 'portrait',
        fallback: '/assets/obuv-6.webp',
        alt: 'Obuv a kabelky',
    },
];

const BY_SLOT = new Map(
    [...SITE_IMAGE_GROUPS.flatMap((group) => group.slots), ...COLLECTION_COVERS].map((info) => [info.slot, info]),
);

export function slotInfo(slot: SiteImageSlot): SiteImageSlotInfo {
    const info = BY_SLOT.get(slot);
    if (!info) throw new Error(`Unknown site image slot: ${slot}`);
    return info;
}

/** The override if the salon set one, otherwise the photo shipped with the site. */
export function imageFor(images: SiteImages, slot: SiteImageSlot): string {
    return images[slot] ?? slotInfo(slot).fallback;
}

/** The cover slot for a category, or undefined for one that has no public page. */
export function coverSlotFor(key: string): SiteImageSlotInfo | undefined {
    return BY_SLOT.get(`collection.${key}` as SiteImageSlot);
}

/** Cover for a collection, which is a slot named after the category. */
export function coverFor(images: SiteImages, key: string): string {
    const info = coverSlotFor(key);
    return info ? imageFor(images, info.slot) : '';
}
