import type { Metadata } from 'next';
import { NotFoundPage } from '@/views/NotFoundPage';

export const metadata: Metadata = {
    title: { absolute: 'Stránka sa nenašla — Svadobný salón Jarka' },
    description: 'Táto adresa na stránke svadobného salónu Jarka neexistuje.',
};

export default function NotFound() {
    return <NotFoundPage />;
}
