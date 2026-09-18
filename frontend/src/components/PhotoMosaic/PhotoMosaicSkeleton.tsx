import styles from './PhotoMosaic.module.less';

const SMALL_TILES = [0, 1, 2, 3];

/**
 * Holds the exact shape the first mosaic group will take. Without it the chips
 * and the banner below sit high on the page and jump once the photos land.
 */
export const PhotoMosaicSkeleton = () => (
    <div className={styles.mosaic} aria-hidden="true">
        <div className={styles.group}>
            <div className={`${styles.group__feature} ${styles.skeleton}`} />
            <div className={styles.group__small}>
                {SMALL_TILES.map((tile) => (
                    <div key={tile} className={`${styles.tile} ${styles.skeleton}`} />
                ))}
            </div>
        </div>
    </div>
);
