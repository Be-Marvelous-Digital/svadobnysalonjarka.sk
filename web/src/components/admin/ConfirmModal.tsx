import { createPortal } from 'react-dom';
import type { ConfirmRequest } from '@/hooks/useConfirm';
import { useDialog } from '@/hooks/useDialog';
import styles from './Admin.module.scss';

interface ConfirmModalProps {
    request: ConfirmRequest;
    onCancel: () => void;
    onAccept: () => void;
}

export const ConfirmModal = ({ request, onCancel, onAccept }: ConfirmModalProps) => {
    const ref = useDialog<HTMLDivElement>(onCancel);

    // Rendered on body: anywhere else it inherits whatever containing block its
    // ancestors happen to create, and lands off-centre.
    return createPortal(
        <div className={styles.overlay}>
            <div ref={ref} className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="confirm-heading">
                <h2 id="confirm-heading" className={styles.dialog__title}>
                    {request.title}
                </h2>
                <p className={styles.dialog__note}>{request.body}</p>

                <div className={styles.dialog__actions}>
                    <button type="button" className={`${styles.action} ${styles['action--danger']}`} onClick={onAccept}>
                        {request.confirmLabel}
                    </button>
                    <button type="button" className={`${styles.action} ${styles['action--quiet']}`} onClick={onCancel}>
                        Zrušiť
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
};
