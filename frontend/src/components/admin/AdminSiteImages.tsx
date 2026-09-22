import { useCallback, useState } from 'react';
import { SITE_IMAGE_GROUPS, slotInfo, type SiteImageSlot } from '@/data/siteImages';
import { useAdminGallery } from '@/hooks/useAdminGallery';
import { useAdminSiteImages } from '@/hooks/useAdminSiteImages';
import { GalleryPicker } from './GalleryPicker';
import { SiteImageCard } from './SiteImageCard';
import styles from './Admin.module.less';

export const AdminSiteImages = () => {
    const site = useAdminSiteImages();
    const gallery = useAdminGallery();
    const [picking, setPicking] = useState<SiteImageSlot | null>(null);

    const { upload, choose } = site;
    const handleUpload = useCallback((slot: SiteImageSlot, file: File) => void upload(slot, file), [upload]);

    const handleChoose = useCallback(
        (url: string) => {
            if (picking) void choose(picking, url);
            setPicking(null);
        },
        [choose, picking],
    );

    const closePicker = useCallback(() => setPicking(null), []);

    return (
        <div className={styles.panel}>
            <div className={styles.card}>
                <div className={styles.card__group}>
                    <span className={styles.card__title}>Fotky na stránkach</span>
                    <span className={styles.card__note}>
                        Pevné fotky mimo galérií. Kliknite na fotku alebo na ňu pretiahnite súbor — zmenší sa a prevedie do WebP
                        rovnako ako v galérii. Kým nič nenahráte, používa sa pôvodná fotka.
                    </span>
                </div>
            </div>

            {site.error ? (
                <div role="alert" className={styles.gallery__empty}>
                    {site.error}
                </div>
            ) : null}

            {SITE_IMAGE_GROUPS.map((group) => (
                <div key={group.page} className={styles.block}>
                    <div className={styles.block__head}>
                        <span className={styles.block__title}>{group.page}</span>
                        <span className={styles.block__count}>{group.slots.length}</span>
                    </div>

                    <div className={styles.slots}>
                        {group.slots.map((info) => (
                            <SiteImageCard
                                key={info.slot}
                                info={info}
                                images={site.images}
                                busy={site.busy === info.slot}
                                onUpload={(file) => handleUpload(info.slot, file)}
                                onPick={() => setPicking(info.slot)}
                                onReset={() => void site.reset(info.slot)}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {picking ? (
                <GalleryPicker
                    slotLabel={slotInfo(picking).label}
                    photos={gallery.photos}
                    onChoose={handleChoose}
                    onClose={closePicker}
                />
            ) : null}
        </div>
    );
};
