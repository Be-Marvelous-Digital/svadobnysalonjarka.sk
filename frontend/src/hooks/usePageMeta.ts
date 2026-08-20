import { useEffect } from 'react';

interface PageMeta {
    title: string;
    description: string;
}

function upsertMeta(name: string, content: string): void {
    let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
    }
    tag.content = content;
}

export function usePageMeta({ title, description }: PageMeta): void {
    useEffect(() => {
        document.title = title;
        upsertMeta('description', description);
    }, [title, description]);
}
