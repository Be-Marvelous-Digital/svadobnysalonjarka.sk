import { useEffect } from 'react';

interface StructuredDataProps {
    id: string;
    schema: Record<string, unknown>;
}

/**
 * Injects one JSON-LD block and removes it when the page unmounts, so a route
 * change never leaves another page's schema behind in the head.
 */
export const StructuredData = ({ id, schema }: StructuredDataProps) => {
    // Callers build the object inline, so the serialised form is the stable dependency.
    const json = JSON.stringify(schema);

    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = id;
        script.textContent = json;
        document.head.appendChild(script);
        return () => script.remove();
    }, [id, json]);

    return null;
};
