export const CATEGORY_KEYS = ['svadobne', 'spolocenske', 'prijimacie', 'zenich', 'obuv', 'galeria', 'instagram'] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
    svadobne: 'Svadobné šaty',
    spolocenske: 'Spoločenské šaty',
    prijimacie: 'Prijímacie šaty',
    zenich: 'Pre ženíchov',
    obuv: 'Obuv a kabelky',
    galeria: 'Galéria salónu',
    instagram: 'Instagram na úvodnej stránke',
};

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
