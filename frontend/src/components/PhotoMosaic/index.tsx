import { useMemo } from 'react';
import { describePhotos, groupPhotos, type MosaicPhoto } from './PhotoMosaic.helpers';
import styles from './PhotoMosaic.module.less';

interface TileProps {
    photo: MosaicPhoto;
    withRatio: boolean;
    onOpen: (index: number) => void;
}

const Tile = ({ photo, withRatio, onOpen }: TileProps) => (
    <button
        type="button"
        className={[styles.tile, withRatio && styles['tile--ratio']].filter(Boolean).join(' ')}
        onClick={() => onOpen(photo.index)}
        aria-label={`Zväčšiť ${photo.alt}`}
    >
        <img src={photo.src} alt={photo.alt} className={styles.tile__image} loading="lazy" />
    </button>
);

interface PhotoMosaicProps {
    sources: string[];
    label: string;
    onOpen: (index: number) => void;
}

export const PhotoMosaic = ({ sources, label, onOpen }: PhotoMosaicProps) => {
    const groups = useMemo(() => groupPhotos(describePhotos(sources, label)), [sources, label]);

    return (
        <div className={styles.mosaic}>
            {groups.map((group) =>
                group.feature ? (
                    <div
                        key={group.id}
                        className={[styles.group, group.mirrored && styles['group--mirrored']].filter(Boolean).join(' ')}
                    >
                        <button
                            type="button"
                            className={styles.group__feature}
                            onClick={() => onOpen(group.feature?.index ?? 0)}
                            aria-label={`Zväčšiť ${group.feature.alt}`}
                        >
                            <img src={group.feature.src} alt={group.feature.alt} className={styles.tile__image} loading="lazy" />
                            <span className={styles.group__caption}>{group.feature.caption}</span>
                        </button>
                        <div className={styles.group__small}>
                            {group.items.map((photo) => (
                                <Tile key={photo.index} photo={photo} withRatio={false} onOpen={onOpen} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div key={group.id} className={styles.grid}>
                        {group.items.map((photo) => (
                            <Tile key={photo.index} photo={photo} withRatio onOpen={onOpen} />
                        ))}
                    </div>
                ),
            )}
        </div>
    );
};
