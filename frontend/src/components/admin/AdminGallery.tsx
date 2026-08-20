import { useCallback, useMemo, useState } from 'react';
import { Chip } from '@/components/Chip';
import { TextInput } from '@/components/Field';
import { COLLECTIONS, type CategoryKey } from '@/data/collections';
import { useAdminGallery } from '@/hooks/useAdminGallery';
import { GalleryTile } from './GalleryTile';
import styles from './Admin.module.less';

export const AdminGallery = () => {
    const [category, setCategory] = useState<CategoryKey>('svadobne');
    const [url, setUrl] = useState('');
    const gallery = useAdminGallery();

    const { replace, remove } = gallery;
    const handleReplace = useCallback((id: string, file: File) => void replace(id, file), [replace]);
    const handleRemove = useCallback((id: string) => void remove(id), [remove]);

    const inCategory = useMemo(() => gallery.photos.filter((photo) => photo.category === category), [gallery.photos, category]);
    const countOf = (key: CategoryKey) => gallery.photos.filter((photo) => photo.category === key).length;
    const label = COLLECTIONS.find((collection) => collection.key === category)?.label ?? '';

    return (
        <div className={styles.gallery}>
            <div className={styles.gallery__tabs}>
                {COLLECTIONS.map((collection) => (
                    <Chip key={collection.key} selected={category === collection.key} onClick={() => setCategory(collection.key)}>
                        {collection.label} ({countOf(collection.key)})
                    </Chip>
                ))}
            </div>

            <div className={styles.card}>
                <div className={styles.card__group}>
                    <span className={styles.card__title}>{label}</span>
                    <span className={styles.card__note}>
                        {inCategory.length
                            ? `${inCategory.length} fotografií v tejto kategórii. Nové sa zobrazia na stránke kolekcie okamžite.`
                            : 'Žiadne fotografie. Pridajte prvé a zobrazia sa na stránke kolekcie.'}
                    </span>
                </div>

                <div className={styles.card__side}>
                    <div className={styles.card__group}>
                        <span className={styles.card__label}>
                            Pridať fotografie z počítača — automaticky sa zmenšia a prevedú do WebP
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className={styles.gallery__file}
                            disabled={gallery.busy}
                            onChange={(event) => {
                                if (event.target.files?.length) void gallery.upload(category, event.target.files);
                                event.target.value = '';
                            }}
                        />
                    </div>

                    <div className={styles.card__group}>
                        <span className={styles.card__label}>Alebo vložiť odkaz na fotografiu</span>
                        <div className={styles.gallery__urlRow}>
                            <TextInput
                                compact
                                type="url"
                                value={url}
                                placeholder="https://…"
                                className={styles.gallery__urlInput}
                                onChange={(event) => setUrl(event.target.value)}
                            />
                            <button
                                type="button"
                                className={`${styles.action} ${styles['action--primary']}`}
                                disabled={gallery.busy || !url.trim()}
                                onClick={() => {
                                    void gallery.addLink(category, url.trim());
                                    setUrl('');
                                }}
                            >
                                Pridať
                            </button>
                        </div>
                    </div>

                    {gallery.error ? <span className={styles.card__label}>{gallery.error}</span> : null}
                </div>
            </div>

            {inCategory.length === 0 ? (
                <div className={styles.gallery__empty}>v tejto kategórii nie sú fotografie</div>
            ) : (
                <div className={styles.gallery__grid}>
                    {inCategory.map((photo, position) => (
                        <GalleryTile
                            key={photo.id}
                            photo={photo}
                            position={position + 1}
                            busy={gallery.busy}
                            onReplace={handleReplace}
                            onRemove={handleRemove}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
