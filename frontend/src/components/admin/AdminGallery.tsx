import { useCallback, useMemo, useState } from 'react';
import { Chip } from '@/components/Chip';
import { CATEGORY_KEYS, CATEGORY_LABELS, type CategoryKey } from '@/data/collections';
import { coverSlotFor } from '@/data/siteImages';
import { plural } from '@/utils/plural';
import { useAdminGallery } from '@/hooks/useAdminGallery';
import { useInView } from '@/hooks/useInView';
import { useUrlState } from '@/hooks/useUrlState';
import { useConfirm } from '@/hooks/useConfirm';
import { useReorderable } from '@/hooks/useReorderable';
import { CategoryIntake } from './CategoryIntake';
import { CollectionCover } from './CollectionCover';
import { ConfirmModal } from './ConfirmModal';
import { GalleryTile } from './GalleryTile';
import styles from './Admin.module.less';

export const AdminGallery = () => {
    // Replaces rather than pushes: this is a filter inside the tab, and every
    // chip click would otherwise be one more press of the back button.
    const [category, setCategory] = useUrlState<CategoryKey>('kategoria', CATEGORY_KEYS, 'svadobne', false);
    const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
    const gallery = useAdminGallery();
    const confirm = useConfirm();

    const { replace, remove, removeMany, reorder, upload } = gallery;
    const handleReplace = useCallback((id: string, file: File) => void replace(id, file), [replace]);
    const handleUpload = useCallback((key: CategoryKey, files: FileList) => void upload(key, files), [upload]);

    const toggleSelect = useCallback((id: string) => {
        setSelected((current) => {
            const next = new Set(current);
            if (!next.delete(id)) next.add(id);
            return next;
        });
    }, []);

    const handleRemove = useCallback(
        (id: string) =>
            confirm.ask({
                title: 'Zmazať fotografiu?',
                body: 'Odstráni sa aj súbor z úložiska. Nedá sa vrátiť späť.',
                confirmLabel: 'Zmazať',
                onConfirm: () => void remove(id),
            }),
        [confirm, remove],
    );

    const inCategory = useMemo(() => gallery.photos.filter((photo) => photo.category === category), [gallery.photos, category]);
    const countOf = (key: CategoryKey) => gallery.photos.filter((photo) => photo.category === key).length;
    // instagram and osalone feed a strip rather than a collection page, so they
    // have no cover and the panel takes the whole row.
    const hasCover = coverSlotFor(category) !== undefined;

    // Narrowed to the category on the way out rather than cleared on the way in:
    // a selection made elsewhere can never be counted or deleted here, so there
    // is nothing to reset when the category changes.
    const selectedHere = useMemo(() => inCategory.filter((photo) => selected.has(photo.id)), [inCategory, selected]);
    const allPicked = inCategory.length > 0 && selectedHere.length === inCategory.length;

    const toggleAll = useCallback(
        () => setSelected(allPicked ? new Set() : new Set(inCategory.map((photo) => photo.id))),
        [allPicked, inCategory],
    );

    const removeSelected = useCallback(() => {
        const ids = selectedHere.map((photo) => photo.id);
        confirm.ask({
            title: `Zmazať ${ids.length} ${plural(ids.length, 'fotografiu', 'fotografie', 'fotografií')}?`,
            body: 'Odstránia sa aj súbory z úložiska. Nedá sa vrátiť späť.',
            confirmLabel: 'Zmazať vybrané',
            onConfirm: () => {
                void removeMany(ids);
                setSelected(new Set());
            },
        });
    }, [confirm, removeMany, selectedHere]);

    const handleCommit = useCallback((ids: string[]) => void reorder(category, ids), [reorder, category]);
    const order = useReorderable({ items: inCategory, keyOf: (photo) => photo.id, onCommit: handleCommit });
    const { move } = order;
    const handleMove = useCallback((id: string, offset: number) => move(id, offset), [move]);

    const headClass = [styles.gallery__top, !hasCover && styles['gallery__top--wide']].filter(Boolean).join(' ');
    // The bar only follows the photos while the photos are on screen; otherwise
    // it sits in the flow and stops hanging over rows nobody is working on.
    const [gridRef, gridInView] = useInView<HTMLDivElement>();
    const barClass = [styles.bulk, gridInView && styles['bulk--stuck']].filter(Boolean).join(' ');

    return (
        <div className={styles.gallery}>
            <div className={styles.gallery__tabs}>
                {CATEGORY_KEYS.map((key) => (
                    <Chip key={key} selected={category === key} onClick={() => setCategory(key)}>
                        {CATEGORY_LABELS[key]} ({countOf(key)})
                    </Chip>
                ))}
            </div>

            <div className={headClass}>
                <CollectionCover category={category} photos={gallery.photos} />

                <div className={styles.gallery__main}>
                    <div className={styles.card__group}>
                        <span className={styles.card__title}>{CATEGORY_LABELS[category]}</span>
                        <span className={styles.card__note}>
                            {inCategory.length
                                ? `${inCategory.length} ${plural(inCategory.length, 'fotografia', 'fotografie', 'fotografií')}. Poradie zmeníte potiahnutím alebo šípkami pod fotografiou — prejaví sa na webe okamžite.`
                                : 'Žiadne fotografie. Pridajte prvé a zobrazia sa na webe.'}
                        </span>
                    </div>

                    <CategoryIntake category={category} busy={gallery.busy} error={gallery.error} onUpload={handleUpload} />
                </div>
            </div>

            {inCategory.length === 0 ? (
                <div className={styles.gallery__empty}>v tejto kategórii nie sú fotografie</div>
            ) : (
                <>
                    <div className={barClass}>
                        <button type="button" className={`${styles.action} ${styles['action--link']}`} onClick={toggleAll}>
                            {allPicked ? 'Zrušiť výber' : 'Označiť všetky'}
                        </button>
                        <span className={styles.bulk__count}>
                            {selectedHere.length > 0 ? `vybraté: ${selectedHere.length}` : 'nič nie je vybraté'}
                        </span>
                        <button
                            type="button"
                            className={`${styles.action} ${styles['action--danger']}`}
                            disabled={gallery.busy || selectedHere.length === 0}
                            onClick={removeSelected}
                        >
                            Zmazať vybrané
                        </button>
                    </div>

                    <div ref={gridRef} className={styles.gallery__grid}>
                        {order.ordered.map((photo, position) => (
                            <GalleryTile
                                key={photo.id}
                                photo={photo}
                                position={position + 1}
                                total={order.ordered.length}
                                busy={gallery.busy}
                                dragging={order.draggingKey === photo.id}
                                dragProps={order.dragProps(photo.id)}
                                selected={selected.has(photo.id)}
                                onToggleSelect={toggleSelect}
                                onMove={handleMove}
                                onReplace={handleReplace}
                                onRemove={handleRemove}
                            />
                        ))}
                    </div>
                </>
            )}

            {confirm.pending ? (
                <ConfirmModal request={confirm.pending} onCancel={confirm.cancel} onAccept={confirm.accept} />
            ) : null}
        </div>
    );
};
