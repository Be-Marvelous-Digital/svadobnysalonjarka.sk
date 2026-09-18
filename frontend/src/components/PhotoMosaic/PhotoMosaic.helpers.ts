export interface MosaicPhoto {
    src: string;
    alt: string;
    caption: string;
    index: number;
}

export interface MosaicGroup {
    id: number;
    mirrored: boolean;
    feature: MosaicPhoto | null;
    items: MosaicPhoto[];
}

const CAPTIONS = ['Detail', 'Zo salónu', 'Skúška', 'Obľúbený model', 'Nová kolekcia', 'Naživo v Galante'];
const GROUP_SIZE = 5;

export function describePhotos(sources: string[], label: string): MosaicPhoto[] {
    return sources.map((src, index) => ({
        src,
        alt: `${label} zo salónu Jarka v Galante — fotografia ${index + 1}`,
        caption: CAPTIONS[index % CAPTIONS.length] ?? '',
        index,
    }));
}

/**
 * Full groups render as one large photo beside a 2×2 block, mirrored on every other group.
 * A trailing partial group falls back to an even grid so the layout never leaves a hole.
 */
export function groupPhotos(photos: MosaicPhoto[]): MosaicGroup[] {
    const groups: MosaicGroup[] = [];

    for (let start = 0, id = 0; start < photos.length; start += GROUP_SIZE, id += 1) {
        const chunk = photos.slice(start, start + GROUP_SIZE);
        if (chunk.length === GROUP_SIZE) {
            groups.push({ id, mirrored: id % 2 === 1, feature: chunk[0] ?? null, items: chunk.slice(1) });
        } else {
            groups.push({ id, mirrored: false, feature: null, items: chunk });
        }
    }

    return groups;
}
