import { useCallback, useState, type DragEvent } from 'react';

interface ReorderableOptions<T> {
    items: T[];
    keyOf: (item: T) => string;
    onCommit: (keys: string[]) => void;
}

export interface ReorderableApi<T> {
    /** Items in their current on-screen order, including any in-flight drag. */
    ordered: T[];
    draggingKey: string | null;
    dragProps: (key: string) => {
        draggable: true;
        onDragStart: (event: DragEvent) => void;
        onDragEnter: (event: DragEvent) => void;
        onDragOver: (event: DragEvent) => void;
        onDrop: (event: DragEvent) => void;
        onDragEnd: () => void;
    };
    /** Keyboard and touch path: no pointer gymnastics required. */
    move: (key: string, offset: number) => void;
    canMove: (key: string, offset: number) => boolean;
}

function reposition<T>(items: T[], keyOf: (item: T) => string, from: string, to: string): T[] {
    const fromIndex = items.findIndex((item) => keyOf(item) === from);
    const toIndex = items.findIndex((item) => keyOf(item) === to);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items;

    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    if (moved) next.splice(toIndex, 0, moved);
    return next;
}

/**
 * Reordering by drag for a mouse, and by explicit move for everything else.
 * Native HTML5 drag events do not fire on touch and cannot be driven from a
 * keyboard, so `move` is not a nicety: without it the feature is unusable on a
 * phone and unreachable for keyboard users.
 *
 * The preview order lives here only while a drag is in flight. Once committed the
 * caller owns the order again, so a later upload or delete is never masked by a
 * stale local copy.
 */
export function useReorderable<T>({ items, keyOf, onCommit }: ReorderableOptions<T>): ReorderableApi<T> {
    const [preview, setPreview] = useState<T[] | null>(null);
    const [draggingKey, setDraggingKey] = useState<string | null>(null);

    const ordered = preview ?? items;

    const dragProps = useCallback(
        (key: string) => ({
            draggable: true as const,
            onDragStart: (event: DragEvent) => {
                setDraggingKey(key);
                setPreview(items);
                event.dataTransfer.effectAllowed = 'move';
                // Firefox ignores a drag that carries no payload.
                event.dataTransfer.setData('text/plain', key);
            },
            onDragEnter: (event: DragEvent) => {
                event.preventDefault();
                if (!draggingKey || draggingKey === key) return;
                setPreview((current) => reposition(current ?? items, keyOf, draggingKey, key));
            },
            onDragOver: (event: DragEvent) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
            },
            onDrop: (event: DragEvent) => {
                event.preventDefault();
                if (preview) onCommit(preview.map(keyOf));
            },
            // Fires after a drop, and on its own when the drag is abandoned. Either
            // way the preview is done: a committed order comes back through `items`.
            onDragEnd: () => {
                setPreview(null);
                setDraggingKey(null);
            },
        }),
        [draggingKey, items, keyOf, onCommit, preview],
    );

    const move = useCallback(
        (key: string, offset: number) => {
            const index = ordered.findIndex((item) => keyOf(item) === key);
            const target = index + offset;
            if (index < 0 || target < 0 || target >= ordered.length) return;

            const next = [...ordered];
            const [moved] = next.splice(index, 1);
            if (moved) next.splice(target, 0, moved);
            onCommit(next.map(keyOf));
        },
        [keyOf, onCommit, ordered],
    );

    const canMove = useCallback(
        (key: string, offset: number) => {
            const index = ordered.findIndex((item) => keyOf(item) === key);
            const target = index + offset;
            return index >= 0 && target >= 0 && target < ordered.length;
        },
        [keyOf, ordered],
    );

    return { ordered, draggingKey, dragProps, move, canMove };
}
