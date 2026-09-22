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

/**
 * Fixed photos the site renders outside the galleries — one per position rather
 * than an ordered list. The frontend owns the labels and the bundled default for
 * each slot; the server only needs to know which keys are real, so an unknown
 * slot cannot be written.
 */
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
] as const;

export type SiteImageSlot = (typeof SITE_IMAGE_SLOTS)[number];

/**
 * The hero is preloaded from the static shell with fetchpriority="high", so its
 * URL has to be known before any JavaScript runs. nginx serves this path and
 * falls back to the bundled photo when nothing has been uploaded, which keeps
 * one stable URL valid in both cases.
 */
export const HERO_SLOT: SiteImageSlot = 'home.hero';
export const HERO_STABLE_PATH = 'site/hero.webp';

/** Opening hours per weekday index (0 = Sunday), as [openHour, closeHour]; null means closed. */
export const OPENING_HOURS: Record<number, [number, number] | null> = {
    0: null,
    1: [10, 17],
    2: [10, 17],
    3: [10, 17],
    4: [10, 17],
    5: [10, 17],
    6: [9, 12],
};

export const DEFAULT_SETTINGS = { duration: 60, buffer: 15 } as const;
