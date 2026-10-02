interface StructuredDataProps {
    schema: Record<string, unknown>;
}

export const StructuredData = ({ schema }: StructuredDataProps) => (
    // `<` escaped so a string in the data can never close the script tag.
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
);
