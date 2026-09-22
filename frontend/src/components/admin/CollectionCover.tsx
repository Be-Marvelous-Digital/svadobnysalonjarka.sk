import { useCallback, useState } from 'react';
import type { AdminPhoto } from '@/api/types';
import type { CategoryKey } from '@/data/collections';
import { coverSlotFor } from '@/data/siteImages';
import { useAdminSiteImages } from '@/hooks/useAdminSiteImages';
import { GalleryPicker } from './GalleryPicker';
import { SiteImageCard } from './SiteImageCard';
import styles from './Admin.module.less';

interface CollectionCoverProps {
    category: CategoryKey;
    photos: AdminPhoto[];
}

/**
 * The photo that stands for the collection on the home page and in a shared link.
 * It sits above the category's own photos rather than in the page list, because
 * that is where someone deciding which shot represents the collection is looking.
 * Deliberately not "the first photo in the list": reordering the gallery would
 * then keep changing the home page.
 */
export const CollectionCover = ({ category, photos }: CollectionCoverProps) => {
    const site = useAdminSiteImages();
    const [picking, setPicking] = useState(false);
    const info = coverSlotFor(category);

    const { upload, choose, reset } = site;

    const handleUpload = useCallback((file: File) => void (info && upload(info.slot, file)), [upload, info]);
    const handleReset = useCallback(() => void (info && reset(info.slot)), [reset, info]);
    const openPicker = useCallback(() => setPicking(true), []);
    const closePicker = useCallback(() => setPicking(false), []);

    const handleChoose = useCallback(
        (url: string) => {
            if (info) void choose(info.slot, url);
            setPicking(false);
        },
        [choose, info],
    );

    if (!info) return null;

    return (
        <div className={styles.gallery__coverCol}>
            <SiteImageCard
                inline
                info={info}
                images={site.images}
                busy={site.busy === info.slot}
                onUpload={handleUpload}
                onPick={openPicker}
                onReset={handleReset}
            />

            {site.error ? (
                <span role="alert" className={styles.card__note}>
                    {site.error}
                </span>
            ) : null}

            {picking ? (
                <GalleryPicker
                    slotLabel={info.label}
                    photos={photos}
                    initialCategory={category}
                    onChoose={handleChoose}
                    onClose={closePicker}
                />
            ) : null}
        </div>
    );
};
