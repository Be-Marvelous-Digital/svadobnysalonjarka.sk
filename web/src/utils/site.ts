export const SITE_ORIGIN = 'https://svadobnysalonjarka.sk';
export const SITE_NAME = 'Svadobný salón Jarka';
export const DEFAULT_IMAGE = '/assets/hero.webp';

export function absoluteUrl(path: string): string {
    return path.startsWith('http') ? path : `${SITE_ORIGIN}${path}`;
}
