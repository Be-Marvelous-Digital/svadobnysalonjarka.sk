import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { imageFor, type SiteImages, type SiteImageSlotInfo } from '@/data/siteImages';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmModal } from './ConfirmModal';
import styles from './Admin.module.less';

const SHAPE_LABELS = { landscape: 'na šírku', portrait: 'na výšku', square: 'štvorec' } as const;

interface SiteImageCardProps {
    info: SiteImageSlotInfo;
    images: SiteImages;
    busy: boolean;
    /** Preview beside the text instead of above it, on a surface of its own. */
    inline?: boolean;
    onUpload: (file: File) => void;
    onPick: () => void;
    onReset: () => void;
}

export const SiteImageCard = ({ info, images, busy, inline = false, onUpload, onPick, onReset }: SiteImageCardProps) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [over, setOver] = useState(false);
    const confirm = useConfirm();
    const custom = images[info.slot] !== undefined;

    const pickFile = useCallback(() => fileRef.current?.click(), []);

    const handleFile = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.target.value = '';
        },
        [onUpload],
    );

    const handleDragOver = useCallback((event: DragEvent) => {
        event.preventDefault();
        setOver(true);
    }, []);

    const handleDragLeave = useCallback(() => setOver(false), []);

    const handleDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault();
            setOver(false);
            const file = event.dataTransfer.files?.[0];
            if (file?.type.startsWith('image/')) onUpload(file);
        },
        [onUpload],
    );

    const handleReset = useCallback(
        () =>
            confirm.ask({
                title: 'Vrátiť pôvodnú fotku?',
                body: `Miesto „${info.label}“ sa vráti na fotku dodanú so stránkou. Nahratú fotku to zmaže.`,
                confirmLabel: 'Vrátiť pôvodnú',
                onConfirm: onReset,
            }),
        [confirm, onReset, info.label],
    );

    const frameClass = [styles.slot__frame, over && styles['slot__frame--over']].filter(Boolean).join(' ');

    const rootClass = [styles.slot, inline && styles['slot--inline']].filter(Boolean).join(' ');

    return (
        <div className={rootClass}>
            <button
                type="button"
                className={frameClass}
                disabled={busy}
                onClick={pickFile}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                aria-label={`Nahradiť fotku na mieste ${info.label}`}
            >
                {/* Fixed height, width from the ratio: the cards line up in the grid
                    while each preview still shows the shape the page will crop to. */}
                <span className={styles.slot__shot} style={{ aspectRatio: info.ratio }}>
                    <img src={imageFor(images, info.slot)} alt="" className={styles.slot__image} loading="lazy" />
                    <span className={styles.slot__overlay}>{busy ? 'Ukladám…' : 'Kliknite alebo sem pretiahnite fotku'}</span>
                </span>
            </button>

            <div className={styles.slot__body}>
                <div className={styles.slot__heading}>
                    <span className={styles.slot__label}>{info.label}</span>
                    <span className={[styles.slot__badge, custom && styles['slot__badge--custom']].filter(Boolean).join(' ')}>
                        {custom ? 'vlastná' : 'pôvodná'}
                    </span>
                </div>

                <span className={styles.slot__hint}>{info.hint}</span>
                <span className={styles.slot__ratio}>
                    {info.ratio.replace(' / ', ':')} · {SHAPE_LABELS[info.shape]}
                </span>

                <div className={styles.slot__actions}>
                    <button
                        type="button"
                        className={`${styles.action} ${styles['action--outline']}`}
                        disabled={busy}
                        onClick={pickFile}
                    >
                        Nahradiť
                    </button>
                    <button
                        type="button"
                        className={`${styles.action} ${styles['action--outline']}`}
                        disabled={busy}
                        onClick={onPick}
                    >
                        Z galérie
                    </button>
                    <button
                        type="button"
                        className={`${styles.action} ${styles['action--link']}`}
                        disabled={busy || !custom}
                        onClick={handleReset}
                    >
                        Vrátiť pôvodnú
                    </button>
                </div>
            </div>

            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />

            {confirm.pending ? (
                <ConfirmModal request={confirm.pending} onCancel={confirm.cancel} onAccept={confirm.accept} />
            ) : null}
        </div>
    );
};
