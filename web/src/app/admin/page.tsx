import type { Metadata } from 'next';
import { Suspense } from 'react';
import { pageMetadata } from '@/lib/seo';
import { ROUTES } from '@/utils/routes';
import { AdminPage } from '@/views/AdminPage';

export const metadata: Metadata = pageMetadata({
    title: 'Správa obsahu — Svadobný salón Jarka',
    description: 'Interná správa rezervácií a galérie.',
    path: ROUTES.admin,
    noIndex: true,
});

export default function Page() {
    return (
        <Suspense fallback={null}>
            <AdminPage />
        </Suspense>
    );
}
